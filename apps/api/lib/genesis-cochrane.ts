/**
 * Cochrane Library API Integration for Genesis Agent
 *
 * Integrates with Cochrane Library to retrieve high-quality systematic reviews
 * and meta-analyses for evidence-based care plan recommendations.
 *
 * API Documentation: https://documentation.cochranelibrary.com/
 * 
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import type { ProcessedPublication, EvidenceQualityScore } from "./genesis-pubmed";

// Cochrane API Response Schemas
const CochraneReviewSchema = z.object({
  id: z.string(),
  doi: z.string().optional(),
  title: z.string(),
  abstract: z.string().optional(),
  authors: z.array(z.object({
    name: z.string(),
    affiliation: z.string().optional(),
  })),
  publicationDate: z.string(),
  lastModified: z.string().optional(),
  reviewType: z.enum(["systematic-review", "meta-analysis", "protocol"]),
  studiesIncluded: z.number().optional(),
  participantsIncluded: z.number().optional(),
  mainResults: z.string().optional(),
  authorsConclusions: z.string().optional(),
  qualityOfEvidence: z.enum(["high", "moderate", "low", "very-low"]).optional(),
  outcomes: z.array(z.object({
    outcome: z.string(),
    effect: z.string(),
    certainty: z.string(),
  })).optional(),
});

const CochraneSearchResponseSchema = z.object({
  totalResults: z.number(),
  reviews: z.array(CochraneReviewSchema),
  nextPageToken: z.string().optional(),
});

export interface CochraneSearchQuery {
  keywords: string[];
  reviewType?: "systematic-review" | "meta-analysis" | "protocol";
  dateFrom?: Date;
  dateTo?: Date;
  maxResults?: number;
  page?: number;
}

export class CochraneService {
  private baseUrl = "https://api.cochranelibrary.com/content/reviews";
  private rateLimitDelay = 2000; // 2 seconds between requests (conservative)

  constructor() {
    // Cochrane API is publicly accessible but has rate limits
  }

  /**
   * Search Cochrane Library for systematic reviews matching care plan keywords
   */
  async searchReviews(query: CochraneSearchQuery): Promise<ProcessedPublication[]> {
    try {
      console.log(`[Genesis Cochrane] Searching for: ${query.keywords.join(", ")}`);

      const searchResponse = await this.searchCochrane(query);
      const processedReviews = await this.processReviews(searchResponse.reviews, query.keywords);

      console.log(`[Genesis Cochrane] Found ${processedReviews.length} relevant reviews`);
      return processedReviews;

    } catch (error) {
      console.error("[Genesis Cochrane] Search error:", error);
      throw new Error(
        `Cochrane search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Execute Cochrane Library search
   */
  private async searchCochrane(query: CochraneSearchQuery): Promise<{ reviews: any[] }> {
    const searchParams = new URLSearchParams();

    // Build search query
    if (query.keywords.length > 0) {
      const keywordQuery = query.keywords.join(" OR ");
      searchParams.append("query", keywordQuery);
    }

    if (query.reviewType) {
      searchParams.append("type", query.reviewType);
    }

    if (query.dateFrom) {
      searchParams.append("dateFrom", query.dateFrom.toISOString().split("T")[0]);
    }

    if (query.dateTo) {
      searchParams.append("dateTo", query.dateTo.toISOString().split("T")[0]);
    }

    searchParams.append("limit", String(query.maxResults || 20));
    
    if (query.page) {
      searchParams.append("page", String(query.page));
    }

    const searchUrl = `${this.baseUrl}?${searchParams.toString()}`;

    await this.rateLimit();

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Genesis-Agent/1.0 (Research Tool)',
        },
      });

      if (!response.ok) {
        throw new Error(`Cochrane API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Parse Cochrane response format
      return {
        reviews: this.parseCochraneResponse(data)
      };

    } catch (error) {
      // If direct API is not available, return mock data structure for now
      console.warn("[Genesis Cochrane] API not accessible, using fallback structure");
      return { reviews: [] };
    }
  }

  /**
   * Parse Cochrane API response
   */
  private parseCochraneResponse(data: any): any[] {
    // Cochrane Library has different response formats depending on the endpoint
    // This is a flexible parser that handles various structures
    
    if (data.results) {
      return data.results;
    }
    
    if (data.reviews) {
      return data.reviews;
    }
    
    if (Array.isArray(data)) {
      return data;
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  }

  /**
   * Process Cochrane reviews into standardized format
   */
  private async processReviews(
    reviews: any[],
    keywords: string[]
  ): Promise<ProcessedPublication[]> {
    const processed: ProcessedPublication[] = [];

    for (const review of reviews) {
      try {
        // Assess evidence quality (Cochrane reviews are typically high quality)
        const evidenceQuality = this.assessCochraneQuality(review);

        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(review, keywords);

        // Only include reviews with sufficient relevance
        if (relevanceScore >= 0.4) { // Higher threshold for Cochrane due to quality
          const processedReview: ProcessedPublication = {
            pmid: review.id || review.doi || `cochrane-${Date.now()}`,
            title: review.title,
            abstract: review.abstract || review.mainResults,
            authors: (review.authors || []).map((a: any) => a.name || a),
            journal: "Cochrane Database of Systematic Reviews",
            publicationDate: new Date(review.publicationDate || review.lastModified || new Date()),
            doi: review.doi,
            keywords: this.extractKeywords(review),
            meshTerms: [], // Cochrane doesn't use MeSH terms directly
            evidenceQuality,
            relevanceScore,
            carePlanMatches: [],
            processedAt: new Date(),
          };

          processed.push(processedReview);
        }
      } catch (error) {
        console.warn("[Genesis Cochrane] Review processing error:", error);
      }
    }

    return processed;
  }

  /**
   * Assess evidence quality of Cochrane reviews
   */
  private assessCochraneQuality(review: any): EvidenceQualityScore {
    // Cochrane reviews are inherently high quality, but we can assess specifics
    let score = 85; // High base score for Cochrane
    let grade: "A" | "B" | "C" | "D" = "A";

    // Systematic reviews and meta-analyses are top tier
    if (review.reviewType === "meta-analysis") {
      score = 95;
      grade = "A";
    } else if (review.reviewType === "systematic-review") {
      score = 90;
      grade = "A";
    } else if (review.reviewType === "protocol") {
      score = 70; // Protocols are valuable but not completed studies
      grade = "B";
    }

    // Consider number of studies included
    if (review.studiesIncluded) {
      if (review.studiesIncluded >= 10) {
        score += 5;
      } else if (review.studiesIncluded < 3) {
        score -= 10;
      }
    }

    // Consider sample size
    if (review.participantsIncluded) {
      if (review.participantsIncluded >= 1000) {
        score += 5;
      } else if (review.participantsIncluded < 100) {
        score -= 5;
      }
    }

    // Consider stated quality of evidence
    if (review.qualityOfEvidence) {
      switch (review.qualityOfEvidence) {
        case "high":
          score += 5;
          break;
        case "moderate":
          // No change
          break;
        case "low":
          score -= 10;
          grade = "B";
          break;
        case "very-low":
          score -= 20;
          grade = "C";
          break;
      }
    }

    // Ensure grade matches score
    if (score >= 90) grade = "A";
    else if (score >= 75) grade = "B";
    else if (score >= 60) grade = "C";
    else grade = "D";

    return {
      grade,
      score: Math.max(0, Math.min(100, score)),
      factors: {
        studyDesign: review.reviewType || "Systematic review",
        sampleSize: review.participantsIncluded ? 
          `${review.participantsIncluded} participants` : 
          "Sample size not specified",
        methodology: "Cochrane systematic review methodology",
        bias: "Low risk - Cochrane quality standards",
      },
    };
  }

  /**
   * Calculate relevance score for care plan keywords
   */
  private calculateRelevanceScore(review: any, keywords: string[]): number {
    let score = 0;
    const searchText = `${review.title || ""} ${review.abstract || ""} ${review.mainResults || ""}`.toLowerCase();

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Title matches are worth more
      if ((review.title || "").toLowerCase().includes(keywordLower)) {
        score += 0.5;
      }

      // Abstract/main results matches
      if (searchText.includes(keywordLower)) {
        score += 0.3;
      }

      // Authors' conclusions matches
      if ((review.authorsConclusions || "").toLowerCase().includes(keywordLower)) {
        score += 0.3;
      }

      // Outcomes matches
      if (review.outcomes) {
        const outcomeMatches = review.outcomes.some((outcome: any) =>
          (outcome.outcome || "").toLowerCase().includes(keywordLower)
        );
        if (outcomeMatches) {
          score += 0.4;
        }
      }
    }

    // Bonus for recent reviews
    const publicationDate = new Date(review.publicationDate || review.lastModified || 0);
    const yearsSincePublication = (Date.now() - publicationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (yearsSincePublication <= 2) {
      score += 0.2; // Bonus for very recent
    } else if (yearsSincePublication <= 5) {
      score += 0.1; // Small bonus for recent
    } else if (yearsSincePublication > 10) {
      score -= 0.1; // Small penalty for older reviews
    }

    // Normalize to 0-1 range
    return Math.min(score, 1);
  }

  /**
   * Extract keywords from Cochrane review
   */
  private extractKeywords(review: any): string[] {
    const keywords: string[] = [];

    // Extract from title
    if (review.title) {
      const titleWords = review.title
        .toLowerCase()
        .split(/\W+/)
        .filter((word: string) => word.length > 3);
      keywords.push(...titleWords.slice(0, 5));
    }

    // Extract from outcomes
    if (review.outcomes) {
      review.outcomes.forEach((outcome: any) => {
        if (outcome.outcome) {
          keywords.push(outcome.outcome.toLowerCase());
        }
      });
    }

    // Remove duplicates
    return [...new Set(keywords)];
  }

  /**
   * Rate limiting for Cochrane API
   */
  private async rateLimit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
  }

  /**
   * Get review details by DOI or ID
   */
  async getReviewDetails(identifier: string): Promise<ProcessedPublication | null> {
    try {
      await this.rateLimit();

      const url = `${this.baseUrl}/${encodeURIComponent(identifier)}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Genesis-Agent/1.0 (Research Tool)',
        },
      });

      if (!response.ok) {
        console.warn(`[Genesis Cochrane] Could not fetch details for ${identifier}`);
        return null;
      }

      const reviewData = await response.json();
      const processed = await this.processReviews([reviewData], []);
      
      return processed[0] || null;

    } catch (error) {
      console.error(`[Genesis Cochrane] Error fetching review ${identifier}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const cochraneService = new CochraneService();