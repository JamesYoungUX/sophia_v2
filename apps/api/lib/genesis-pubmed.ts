/**
 * PubMed API Integration for Genesis Agent
 *
 * This service handles literature ingestion from PubMed using NCBI's E-utilities API.
 * It provides automated searching, article retrieval, and processing for care plan relevance.
 *
 * API Documentation: https://ncbiinsights.ncbi.nlm.nih.gov/2017/11/02/new-api-keys-for-the-e-utilities/
 * Rate Limits: 3 requests/second without API key, 10 requests/second with API key
 */

import { z } from "zod";

// PubMed API Response Schemas
const PubMedArticleSchema = z.object({
  pmid: z.string(),
  title: z.string(),
  abstract: z.string().optional(),
  authors: z.array(
    z.object({
      name: z.string(),
      affiliation: z.string().optional(),
    }),
  ),
  journal: z.object({
    title: z.string(),
    issn: z.string().optional(),
    volume: z.string().optional(),
    issue: z.string().optional(),
    pages: z.string().optional(),
  }),
  publicationDate: z.string(),
  doi: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  meshTerms: z.array(z.string()).optional(),
  publicationType: z.array(z.string()).optional(),
});

const PubMedSearchResponseSchema = z.object({
  count: z.number(),
  articles: z.array(PubMedArticleSchema),
  nextCursor: z.string().optional(),
});

// Evidence Quality Assessment
export type EvidenceQuality = "A" | "B" | "C" | "D";

export interface EvidenceQualityScore {
  grade: EvidenceQuality;
  score: number; // 0-100
  factors: {
    studyDesign: string;
    sampleSize: string;
    methodology: string;
    bias: string;
  };
}

export interface ProcessedPublication {
  pmid: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal: string;
  publicationDate: Date;
  doi?: string;
  keywords: string[];
  meshTerms: string[];
  evidenceQuality: EvidenceQualityScore;
  relevanceScore: number; // 0-1
  carePlanMatches: string[]; // IDs of matching care plans
  processedAt: Date;
}

export interface PubMedSearchQuery {
  keywords: string[];
  dateFrom?: Date;
  dateTo?: Date;
  publicationTypes?: string[];
  maxResults?: number;
}

export class PubMedService {
  private baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  private apiKey?: string;
  private rateLimitDelay = 1000; // 1 second between requests (conservative)

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  /**
   * Search PubMed for articles matching care plan keywords
   */
  async searchLiterature(
    query: PubMedSearchQuery,
  ): Promise<ProcessedPublication[]> {
    try {
      console.log(
        `[Genesis PubMed] Searching for: ${query.keywords.join(", ")}`,
      );

      // Build search query
      const searchQuery = this.buildSearchQuery(query);

      // Search PubMed
      const searchResponse = await this.searchPubMed(
        searchQuery,
        query.maxResults || 50,
      );

      // Process and filter articles
      const processedArticles = await this.processArticles(
        searchResponse.articles,
        query.keywords,
      );

      console.log(
        `[Genesis PubMed] Found ${processedArticles.length} relevant articles`,
      );

      return processedArticles;
    } catch (error) {
      console.error("[Genesis PubMed] Search error:", error);
      throw new Error(
        `PubMed search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Build PubMed search query string
   */
  private buildSearchQuery(query: PubMedSearchQuery): string {
    const parts: string[] = [];

    // Add keywords
    if (query.keywords.length > 0) {
      const keywordQuery = query.keywords
        .map((k) => `"${k}"[Title/Abstract]`)
        .join(" OR ");
      parts.push(`(${keywordQuery})`);
    }

    // Add date range
    if (query.dateFrom) {
      const fromDate = query.dateFrom.toISOString().split("T")[0];
      parts.push(
        `"${fromDate}"[Date - Publication] : "3000"[Date - Publication]`,
      );
    }

    // Add publication types
    if (query.publicationTypes && query.publicationTypes.length > 0) {
      const typeQuery = query.publicationTypes
        .map((t) => `"${t}"[Publication Type]`)
        .join(" OR ");
      parts.push(`(${typeQuery})`);
    }

    return parts.join(" AND ");
  }

  /**
   * Execute PubMed search
   */
  private async searchPubMed(
    query: string,
    maxResults: number,
  ): Promise<{ articles: any[] }> {
    // First, search for article IDs
    const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json${this.apiKey ? `&api_key=${this.apiKey}` : ""}`;

    await this.rateLimit();
    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      throw new Error(
        `PubMed search failed: ${searchResponse.status} ${searchResponse.statusText}`,
      );
    }

    const searchData = await searchResponse.json();
    const pmids = searchData.esearchresult?.idlist || [];

    if (pmids.length === 0) {
      return { articles: [] };
    }

    // Then, fetch article details
    const fetchUrl = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=xml${this.apiKey ? `&api_key=${this.apiKey}` : ""}`;

    await this.rateLimit();
    const fetchResponse = await fetch(fetchUrl);

    if (!fetchResponse.ok) {
      throw new Error(
        `PubMed fetch failed: ${fetchResponse.status} ${fetchResponse.statusText}`,
      );
    }

    const xmlText = await fetchResponse.text();
    const articles = this.parsePubMedXML(xmlText);

    return { articles };
  }

  /**
   * Parse PubMed XML response
   */
  private parsePubMedXML(xmlText: string): any[] {
    // This is a simplified parser - in production, use a proper XML parser
    const articles: any[] = [];

    // Extract articles using regex (simplified approach)
    const articleMatches = xmlText.match(
      /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g,
    );

    if (!articleMatches) return articles;

    for (const articleXml of articleMatches) {
      try {
        const article = this.parseSingleArticle(articleXml);
        if (article) {
          articles.push(article);
        }
      } catch (error) {
        console.warn("[Genesis PubMed] Failed to parse article:", error);
      }
    }

    return articles;
  }

  /**
   * Parse a single PubMed article
   */
  private parseSingleArticle(articleXml: string): any | null {
    try {
      // Extract basic fields using regex
      const pmid = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1];
      const title = articleXml.match(
        /<ArticleTitle[^>]*>([^<]+)<\/ArticleTitle>/,
      )?.[1];
      const abstract = articleXml.match(
        /<AbstractText[^>]*>([^<]+)<\/AbstractText>/,
      )?.[1];

      if (!pmid || !title) return null;

      // Extract authors
      const authorMatches = articleXml.match(
        /<Author[^>]*>[\s\S]*?<LastName[^>]*>([^<]+)<\/LastName>[\s\S]*?<ForeName[^>]*>([^<]+)<\/ForeName>[\s\S]*?<\/Author>/g,
      );
      const authors =
        authorMatches?.map((match) => {
          const lastName =
            match.match(/<LastName[^>]*>([^<]+)<\/LastName>/)?.[1] || "";
          const foreName =
            match.match(/<ForeName[^>]*>([^<]+)<\/ForeName>/)?.[1] || "";
          return `${foreName} ${lastName}`.trim();
        }) || [];

      // Extract journal info
      const journalTitle =
        articleXml.match(
          /<Journal[^>]*>[\s\S]*?<Title[^>]*>([^<]+)<\/Title>/,
        )?.[1] || "";
      const volume = articleXml.match(/<Volume[^>]*>([^<]+)<\/Volume>/)?.[1];
      const issue = articleXml.match(/<Issue[^>]*>([^<]+)<\/Issue>/)?.[1];
      const pages = articleXml.match(
        /<MedlinePgn[^>]*>([^<]+)<\/MedlinePgn>/,
      )?.[1];

      // Extract publication date
      const pubDate = articleXml.match(
        /<PubDate[^>]*>[\s\S]*?<Year[^>]*>(\d{4})<\/Year>/,
      )?.[1];
      const publicationDate = pubDate
        ? `${pubDate}-01-01`
        : new Date().toISOString().split("T")[0];

      // Extract DOI
      const doi = articleXml.match(
        /<ELocationID[^>]*EIdType="doi"[^>]*>([^<]+)<\/ELocationID>/,
      )?.[1];

      // Extract MeSH terms
      const meshMatches = articleXml.match(
        /<MeshHeading[^>]*>[\s\S]*?<DescriptorName[^>]*>([^<]+)<\/DescriptorName>/g,
      );
      const meshTerms =
        meshMatches
          ?.map(
            (match) =>
              match.match(
                /<DescriptorName[^>]*>([^<]+)<\/DescriptorName>/,
              )?.[1],
          )
          .filter(Boolean) || [];

      return {
        pmid,
        title,
        abstract,
        authors: authors.map((name) => ({ name })),
        journal: {
          title: journalTitle,
          volume,
          issue,
          pages,
        },
        publicationDate,
        doi,
        meshTerms,
        publicationType: [], // Would need additional parsing
      };
    } catch (error) {
      console.warn("[Genesis PubMed] Article parsing error:", error);
      return null;
    }
  }

  /**
   * Process and filter articles for relevance
   */
  private async processArticles(
    articles: any[],
    keywords: string[],
  ): Promise<ProcessedPublication[]> {
    const processed: ProcessedPublication[] = [];

    for (const article of articles) {
      try {
        // Assess evidence quality
        const evidenceQuality = this.assessEvidenceQuality(article);

        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(article, keywords);

        // Only include articles with sufficient relevance
        if (relevanceScore >= 0.3) {
          // Configurable threshold
          const processedArticle: ProcessedPublication = {
            pmid: article.pmid,
            title: article.title,
            abstract: article.abstract,
            authors: article.authors.map((a: any) => a.name),
            journal: article.journal.title,
            publicationDate: new Date(article.publicationDate),
            doi: article.doi,
            keywords: [], // Would need additional parsing
            meshTerms: article.meshTerms || [],
            evidenceQuality,
            relevanceScore,
            carePlanMatches: [], // Will be populated by care plan matching
            processedAt: new Date(),
          };

          processed.push(processedArticle);
        }
      } catch (error) {
        console.warn("[Genesis PubMed] Article processing error:", error);
      }
    }

    return processed;
  }

  /**
   * Assess evidence quality of a publication
   */
  private assessEvidenceQuality(article: any): EvidenceQualityScore {
    // Simplified evidence quality assessment
    // In production, this would be much more sophisticated

    let score = 50; // Base score
    let grade: EvidenceQuality = "C";

    // Check for systematic reviews and meta-analyses
    if (
      article.publicationType?.some(
        (type: string) =>
          type.toLowerCase().includes("systematic") ||
          type.toLowerCase().includes("meta-analysis"),
      )
    ) {
      score += 30;
      grade = "A";
    }

    // Check for randomized controlled trials
    if (
      article.publicationType?.some(
        (type: string) =>
          type.toLowerCase().includes("randomized") ||
          type.toLowerCase().includes("clinical trial"),
      )
    ) {
      score += 20;
      grade = "B";
    }

    // Check for high-impact journals (simplified)
    const highImpactJournals = [
      "new england journal of medicine",
      "the lancet",
      "jama",
      "bmj",
      "annals of internal medicine",
    ];

    if (
      highImpactJournals.some((journal) =>
        article.journal.title.toLowerCase().includes(journal),
      )
    ) {
      score += 10;
    }

    // Adjust grade based on score
    if (score >= 80) grade = "A";
    else if (score >= 60) grade = "B";
    else if (score >= 40) grade = "C";
    else grade = "D";

    return {
      grade,
      score,
      factors: {
        studyDesign: "Automated assessment",
        sampleSize: "Not assessed",
        methodology: "Not assessed",
        bias: "Not assessed",
      },
    };
  }

  /**
   * Calculate relevance score for care plan keywords
   */
  private calculateRelevanceScore(article: any, keywords: string[]): number {
    let score = 0;
    const text = `${article.title} ${article.abstract || ""}`.toLowerCase();

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Title matches are worth more
      if (article.title.toLowerCase().includes(keywordLower)) {
        score += 0.4;
      }

      // Abstract matches
      if (
        article.abstract &&
        article.abstract.toLowerCase().includes(keywordLower)
      ) {
        score += 0.2;
      }

      // MeSH term matches
      if (
        article.meshTerms?.some((term: string) =>
          term.toLowerCase().includes(keywordLower),
        )
      ) {
        score += 0.3;
      }
    }

    // Normalize to 0-1 range
    return Math.min(score, 1);
  }

  /**
   * Rate limiting for PubMed API
   */
  private async rateLimit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
  }
}

// Export singleton instance
export const pubmedService = new PubMedService(process.env.PUBMED_API_KEY);
