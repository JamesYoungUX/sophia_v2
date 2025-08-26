/**
 * Clinical Guidelines API Integration for Genesis Agent
 *
 * Integrates with multiple clinical guideline sources to retrieve
 * authoritative clinical practice guidelines for evidence-based recommendations.
 *
 * Sources:
 * - NICE (National Institute for Health and Care Excellence)
 * - AHA (American Heart Association)
 * - ACS (American Cancer Society)
 * - CDC Guidelines
 * - Medical Society Guidelines
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import type { ProcessedPublication, EvidenceQualityScore } from "./genesis-pubmed";

// Clinical Guideline Schema
const ClinicalGuidelineSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  summary: z.string().optional(),
  fullText: z.string().optional(),
  publicationDate: z.string(),
  lastUpdated: z.string().optional(),
  version: z.string().optional(),
  doi: z.string().optional(),
  url: z.string(),
  specialty: z.string().optional(),
  condition: z.string().optional(),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    strength: z.enum(["strong", "conditional", "weak"]).optional(),
    evidenceLevel: z.enum(["A", "B", "C", "D"]).optional(),
    population: z.string().optional(),
  })).optional(),
  keywords: z.array(z.string()).optional(),
  targetAudience: z.string().optional(),
  methodology: z.string().optional(),
});

export interface GuidelineSearchQuery {
  keywords: string[];
  organization?: "NICE" | "AHA" | "ACS" | "CDC" | "all";
  specialty?: string;
  condition?: string;
  dateFrom?: Date;
  dateTo?: Date;
  maxResults?: number;
}

export class ClinicalGuidelinesService {
  private rateLimitDelay = 1500; // 1.5 seconds between requests
  private sources: GuidelineSource[] = [
    {
      name: "NICE",
      baseUrl: "https://www.nice.org.uk/api/guidance",
      organization: "National Institute for Health and Care Excellence",
      country: "UK"
    },
    {
      name: "AHA",
      baseUrl: "https://professional.heart.org/api/statements",
      organization: "American Heart Association",
      country: "US"
    },
    {
      name: "CDC",
      baseUrl: "https://www.cdc.gov/api/guidelines",
      organization: "Centers for Disease Control and Prevention",
      country: "US"
    }
  ];

  /**
   * Search clinical guidelines from multiple authoritative sources
   */
  async searchGuidelines(query: GuidelineSearchQuery): Promise<ProcessedPublication[]> {
    try {
      console.log(`[Genesis Guidelines] Searching for: ${query.keywords.join(", ")}`);

      const allResults: ProcessedPublication[] = [];
      const searchPromises: Promise<ProcessedPublication[]>[] = [];

      // Search each source based on organization filter
      for (const source of this.sources) {
        if (!query.organization || query.organization === "all" || query.organization === source.name) {
          searchPromises.push(this.searchSource(source, query));
        }
      }

      // Execute searches in parallel but respect rate limits
      for (const searchPromise of searchPromises) {
        try {
          const results = await searchPromise;
          allResults.push(...results);
          await this.rateLimit(); // Rate limit between sources
        } catch (error) {
          console.warn(`[Genesis Guidelines] Search failed for source:`, error);
          // Continue with other sources even if one fails
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueResults = this.deduplicateGuidelines(allResults);
      const sortedResults = uniqueResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      console.log(`[Genesis Guidelines] Found ${sortedResults.length} relevant guidelines`);
      return sortedResults.slice(0, query.maxResults || 20);

    } catch (error) {
      console.error("[Genesis Guidelines] Search error:", error);
      throw new Error(
        `Guidelines search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Search a specific guideline source
   */
  private async searchSource(
    source: GuidelineSource, 
    query: GuidelineSearchQuery
  ): Promise<ProcessedPublication[]> {
    
    // For now, return mock guidelines as many APIs require special access
    // In production, implement actual API calls for each source
    const mockGuidelines = this.generateMockGuidelines(source, query);
    return this.processGuidelines(mockGuidelines, source, query.keywords);
  }

  /**
   * Generate realistic mock guidelines for development
   * In production, replace with actual API calls
   */
  private generateMockGuidelines(source: GuidelineSource, query: GuidelineSearchQuery): any[] {
    const mockGuidelines: any[] = [];

    // Generate relevant mock guidelines based on keywords
    for (const keyword of query.keywords.slice(0, 3)) { // Limit to avoid too many results
      const guideline = {
        id: `${source.name.toLowerCase()}-${keyword.toLowerCase().replace(/\s+/g, "-")}-2024`,
        title: `${source.organization} Guidelines for ${keyword}`,
        organization: source.organization,
        summary: `Clinical practice guidelines for the management and treatment of ${keyword}. Evidence-based recommendations for healthcare professionals.`,
        publicationDate: "2024-01-15",
        lastUpdated: "2024-06-01",
        version: "2024.1",
        url: `${source.baseUrl}/${keyword.toLowerCase().replace(/\s+/g, "-")}`,
        specialty: this.inferSpecialty(keyword),
        condition: keyword,
        recommendations: [
          {
            recommendation: `First-line treatment approach for ${keyword} should follow evidence-based protocols`,
            strength: "strong" as const,
            evidenceLevel: "A" as const,
            population: "Adult patients"
          },
          {
            recommendation: `Regular monitoring and assessment of ${keyword} outcomes is recommended`,
            strength: "conditional" as const,
            evidenceLevel: "B" as const,
            population: "All patients"
          }
        ],
        keywords: [keyword.toLowerCase(), "clinical practice", "evidence-based"],
        targetAudience: "Healthcare professionals, Clinical practitioners",
        methodology: "Systematic literature review and expert consensus"
      };

      mockGuidelines.push(guideline);
    }

    return mockGuidelines;
  }

  /**
   * Process guidelines into standardized format
   */
  private async processGuidelines(
    guidelines: any[],
    source: GuidelineSource,
    keywords: string[]
  ): Promise<ProcessedPublication[]> {
    const processed: ProcessedPublication[] = [];

    for (const guideline of guidelines) {
      try {
        // Assess guideline quality
        const evidenceQuality = this.assessGuidelineQuality(guideline, source);

        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(guideline, keywords);

        // Only include guidelines with sufficient relevance
        if (relevanceScore >= 0.3) {
          const processedGuideline: ProcessedPublication = {
            pmid: guideline.id,
            title: guideline.title,
            abstract: guideline.summary || guideline.fullText?.substring(0, 500),
            authors: [guideline.organization],
            journal: `${guideline.organization} Clinical Guidelines`,
            publicationDate: new Date(guideline.publicationDate),
            doi: guideline.doi,
            keywords: guideline.keywords || [guideline.condition].filter(Boolean),
            meshTerms: [], // Guidelines don't typically use MeSH terms
            evidenceQuality,
            relevanceScore,
            carePlanMatches: [],
            processedAt: new Date(),
          };

          processed.push(processedGuideline);
        }
      } catch (error) {
        console.warn("[Genesis Guidelines] Guideline processing error:", error);
      }
    }

    return processed;
  }

  /**
   * Assess quality of clinical guidelines
   */
  private assessGuidelineQuality(guideline: any, source: GuidelineSource): EvidenceQualityScore {
    let score = 80; // High base score for authoritative guidelines
    let grade: "A" | "B" | "C" | "D" = "A";

    // Organization-specific quality assessment
    switch (source.name) {
      case "NICE":
        score = 95; // NICE has very rigorous methodology
        break;
      case "AHA":
        score = 90; // AHA guidelines are highly respected
        break;
      case "CDC":
        score = 88; // CDC guidelines are evidence-based
        break;
      default:
        score = 80; // Other reputable organizations
    }

    // Consider recency
    const publicationDate = new Date(guideline.publicationDate);
    const lastUpdated = guideline.lastUpdated ? new Date(guideline.lastUpdated) : publicationDate;
    const monthsSinceUpdate = (Date.now() - lastUpdated.getTime()) / (30.44 * 24 * 60 * 60 * 1000);

    if (monthsSinceUpdate <= 12) {
      score += 5; // Recent guidelines
    } else if (monthsSinceUpdate <= 36) {
      // No change for moderately recent
    } else if (monthsSinceUpdate > 60) {
      score -= 10; // Older guidelines may be outdated
    }

    // Consider methodology
    if (guideline.methodology?.toLowerCase().includes("systematic")) {
      score += 5;
    }

    // Consider evidence levels in recommendations
    if (guideline.recommendations) {
      const strongRecs = guideline.recommendations.filter((r: any) => 
        r.strength === "strong" && r.evidenceLevel === "A"
      ).length;
      
      if (strongRecs > 0) {
        score += 3;
      }
    }

    // Adjust grade based on score
    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else grade = "D";

    return {
      grade,
      score: Math.max(0, Math.min(100, score)),
      factors: {
        studyDesign: "Clinical practice guideline",
        sampleSize: "Population-based recommendations",
        methodology: guideline.methodology || "Expert consensus with evidence review",
        bias: `Low risk - ${source.organization} standards`,
      },
    };
  }

  /**
   * Calculate relevance score for care plan keywords
   */
  private calculateRelevanceScore(guideline: any, keywords: string[]): number {
    let score = 0;
    const searchText = `${guideline.title} ${guideline.summary || ""} ${guideline.condition || ""}`.toLowerCase();

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Exact title matches are highly relevant
      if (guideline.title.toLowerCase().includes(keywordLower)) {
        score += 0.6;
      }

      // Condition matches are very relevant
      if ((guideline.condition || "").toLowerCase().includes(keywordLower)) {
        score += 0.5;
      }

      // Summary/content matches
      if (searchText.includes(keywordLower)) {
        score += 0.3;
      }

      // Specialty matches
      if ((guideline.specialty || "").toLowerCase().includes(keywordLower)) {
        score += 0.2;
      }

      // Keyword matches
      if (guideline.keywords?.some((kw: string) => kw.toLowerCase().includes(keywordLower))) {
        score += 0.4;
      }

      // Recommendation text matches
      if (guideline.recommendations) {
        const recMatches = guideline.recommendations.some((rec: any) =>
          rec.recommendation.toLowerCase().includes(keywordLower)
        );
        if (recMatches) {
          score += 0.4;
        }
      }
    }

    // Normalize to 0-1 range
    return Math.min(score, 1);
  }

  /**
   * Remove duplicate guidelines across sources
   */
  private deduplicateGuidelines(guidelines: ProcessedPublication[]): ProcessedPublication[] {
    const seen = new Set<string>();
    const unique: ProcessedPublication[] = [];

    for (const guideline of guidelines) {
      // Create a key based on title and organization
      const key = `${guideline.title.toLowerCase().replace(/\s+/g, " ")}-${guideline.authors[0]}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(guideline);
      }
    }

    return unique;
  }

  /**
   * Infer medical specialty from keyword
   */
  private inferSpecialty(keyword: string): string {
    const keywordLower = keyword.toLowerCase();

    if (keywordLower.includes("heart") || keywordLower.includes("cardiac") || keywordLower.includes("hypertension")) {
      return "Cardiology";
    }
    if (keywordLower.includes("diabetes") || keywordLower.includes("endocrine")) {
      return "Endocrinology";
    }
    if (keywordLower.includes("cancer") || keywordLower.includes("oncology")) {
      return "Oncology";
    }
    if (keywordLower.includes("mental") || keywordLower.includes("psychiatric")) {
      return "Psychiatry";
    }
    if (keywordLower.includes("surgery") || keywordLower.includes("surgical")) {
      return "Surgery";
    }

    return "Internal Medicine";
  }

  /**
   * Rate limiting for guideline APIs
   */
  private async rateLimit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
  }

  /**
   * Get specific guideline details by ID
   */
  async getGuidelineDetails(
    organization: string, 
    guidelineId: string
  ): Promise<ProcessedPublication | null> {
    const source = this.sources.find(s => s.name === organization);
    if (!source) {
      throw new Error(`Unknown guideline organization: ${organization}`);
    }

    try {
      await this.rateLimit();
      
      // In production, implement actual API call
      // For now, return mock detailed guideline
      const mockDetailedGuideline = {
        id: guidelineId,
        title: `Detailed ${organization} Clinical Guideline`,
        organization: source.organization,
        summary: "Comprehensive clinical practice guideline with detailed recommendations...",
        fullText: "Full guideline text would be here in production...",
        publicationDate: "2024-01-15",
        lastUpdated: "2024-06-01",
        version: "2024.1",
        url: `${source.baseUrl}/${guidelineId}`,
      };

      const processed = await this.processGuidelines([mockDetailedGuideline], source, []);
      return processed[0] || null;

    } catch (error) {
      console.error(`[Genesis Guidelines] Error fetching guideline ${guidelineId}:`, error);
      return null;
    }
  }
}

interface GuidelineSource {
  name: string;
  baseUrl: string;
  organization: string;
  country: string;
}

// Export singleton instance
export const clinicalGuidelinesService = new ClinicalGuidelinesService();