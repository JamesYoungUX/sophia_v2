/**
 * ClinicalTrials.gov API Integration for Genesis Agent
 *
 * Integrates with ClinicalTrials.gov to retrieve ongoing and completed clinical trials
 * relevant to care plan conditions and treatments for evidence-based recommendations.
 *
 * API Documentation: https://clinicaltrials.gov/data-api/api
 * 
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { z } from "zod";
import type { ProcessedPublication, EvidenceQualityScore } from "./genesis-pubmed";

// ClinicalTrials.gov API Response Schemas
const ClinicalTrialSchema = z.object({
  nctId: z.string(),
  briefTitle: z.string(),
  officialTitle: z.string().optional(),
  briefSummary: z.string().optional(),
  detailedDescription: z.string().optional(),
  overallStatus: z.enum([
    "RECRUITING", "ACTIVE_NOT_RECRUITING", "COMPLETED", "TERMINATED", 
    "SUSPENDED", "WITHDRAWN", "UNKNOWN"
  ]),
  phase: z.array(z.enum(["EARLY_PHASE1", "PHASE1", "PHASE2", "PHASE3", "PHASE4", "NA"])).optional(),
  studyType: z.enum(["INTERVENTIONAL", "OBSERVATIONAL", "EXPANDED_ACCESS"]),
  primaryPurpose: z.enum([
    "TREATMENT", "PREVENTION", "DIAGNOSTIC", "SUPPORTIVE_CARE", 
    "SCREENING", "HEALTH_SERVICES_RESEARCH", "BASIC_SCIENCE", "OTHER"
  ]).optional(),
  masking: z.object({
    masking: z.enum(["NONE", "SINGLE", "DOUBLE", "TRIPLE", "QUADRUPLE"]).optional(),
    maskingDescription: z.string().optional(),
  }).optional(),
  enrollment: z.object({
    count: z.number().optional(),
    type: z.enum(["ACTUAL", "ESTIMATED"]).optional(),
  }).optional(),
  conditions: z.array(z.string()),
  interventions: z.array(z.object({
    type: z.string(),
    name: z.string(),
    description: z.string().optional(),
  })).optional(),
  primaryOutcomes: z.array(z.object({
    measure: z.string(),
    timeFrame: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  secondaryOutcomes: z.array(z.object({
    measure: z.string(),
    timeFrame: z.string().optional(),
    description: z.string().optional(),
  })).optional(),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  lastUpdateDate: z.string().optional(),
  resultsAvailable: z.boolean().optional(),
  studyResults: z.object({
    participantFlow: z.any().optional(),
    baselineCharacteristics: z.any().optional(),
    outcomeMeasures: z.any().optional(),
  }).optional(),
  sponsors: z.array(z.object({
    name: z.string(),
    class: z.enum(["NIH", "INDUSTRY", "FED", "OTHER"]).optional(),
  })).optional(),
  locations: z.array(z.object({
    facility: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
  })).optional(),
});

export interface ClinicalTrialsQuery {
  keywords: string[];
  conditions?: string[];
  interventions?: string[];
  phase?: string[];
  status?: ("RECRUITING" | "COMPLETED" | "ACTIVE_NOT_RECRUITING")[];
  studyType?: "INTERVENTIONAL" | "OBSERVATIONAL";
  resultsAvailable?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  maxResults?: number;
}

export class ClinicalTrialsService {
  private baseUrl = "https://clinicaltrials.gov/api/v2/studies";
  private rateLimitDelay = 1000; // 1 second between requests (respectful to public API)

  constructor() {
    // ClinicalTrials.gov API is publicly accessible with reasonable rate limits
  }

  /**
   * Search ClinicalTrials.gov for relevant studies
   */
  async searchTrials(query: ClinicalTrialsQuery): Promise<ProcessedPublication[]> {
    try {
      console.log(`[Genesis ClinicalTrials] Searching for: ${query.keywords.join(", ")}`);

      const searchResponse = await this.searchClinicalTrials(query);
      const processedTrials = await this.processTrials(searchResponse.studies, query.keywords);

      console.log(`[Genesis ClinicalTrials] Found ${processedTrials.length} relevant trials`);
      return processedTrials;

    } catch (error) {
      console.error("[Genesis ClinicalTrials] Search error:", error);
      throw new Error(
        `ClinicalTrials.gov search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Execute ClinicalTrials.gov search
   */
  private async searchClinicalTrials(query: ClinicalTrialsQuery): Promise<{ studies: any[] }> {
    const searchParams = new URLSearchParams();

    // Build query parameters
    if (query.keywords.length > 0) {
      // Use advanced search syntax for better matching
      const keywordQuery = query.keywords.map(k => `"${k}"`).join(" OR ");
      searchParams.append("query.term", keywordQuery);
    }

    if (query.conditions && query.conditions.length > 0) {
      searchParams.append("query.cond", query.conditions.join(","));
    }

    if (query.interventions && query.interventions.length > 0) {
      searchParams.append("query.intr", query.interventions.join(","));
    }

    if (query.phase && query.phase.length > 0) {
      searchParams.append("filter.phase", query.phase.join(","));
    }

    if (query.status && query.status.length > 0) {
      searchParams.append("filter.overallStatus", query.status.join(","));
    }

    if (query.studyType) {
      searchParams.append("filter.studyType", query.studyType);
    }

    if (query.resultsAvailable) {
      searchParams.append("filter.results", "WITH_RESULTS");
    }

    if (query.dateFrom) {
      searchParams.append("filter.studyFirstPostDateFrom", query.dateFrom.toISOString().split("T")[0]);
    }

    if (query.dateTo) {
      searchParams.append("filter.studyFirstPostDateTo", query.dateTo.toISOString().split("T")[0]);
    }

    // Set reasonable defaults
    searchParams.append("pageSize", String(query.maxResults || 50));
    searchParams.append("format", "json");
    
    // Include essential fields for analysis
    searchParams.append("fields", 
      "NCTId,BriefTitle,OfficialTitle,BriefSummary,DetailedDescription," +
      "OverallStatus,Phase,StudyType,PrimaryPurpose,Condition,InterventionName," +
      "PrimaryOutcomeMeasure,SecondaryOutcomeMeasure,StartDate,CompletionDate," +
      "EnrollmentCount,HasResults,Sponsor,LocationFacility,LocationCity,LocationCountry"
    );

    const searchUrl = `${this.baseUrl}?${searchParams.toString()}`;

    await this.rateLimit();

    try {
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Genesis-Agent/1.0 (Medical Research Tool)',
        },
      });

      if (!response.ok) {
        throw new Error(`ClinicalTrials.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        studies: this.parseClinicalTrialsResponse(data)
      };

    } catch (error) {
      console.warn("[Genesis ClinicalTrials] API request failed, using fallback");
      // Return empty structure if API is not accessible
      return { studies: [] };
    }
  }

  /**
   * Parse ClinicalTrials.gov API response
   */
  private parseClinicalTrialsResponse(data: any): any[] {
    // Handle different response formats from ClinicalTrials.gov API
    if (data.studies) {
      return data.studies;
    }
    
    if (data.results) {
      return data.results;
    }
    
    if (Array.isArray(data)) {
      return data;
    }

    // Handle nested structure
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    return [];
  }

  /**
   * Process clinical trials into standardized format
   */
  private async processTrials(
    trials: any[],
    keywords: string[]
  ): Promise<ProcessedPublication[]> {
    const processed: ProcessedPublication[] = [];

    for (const trial of trials) {
      try {
        // Assess trial quality and evidence value
        const evidenceQuality = this.assessTrialQuality(trial);

        // Calculate relevance score
        const relevanceScore = this.calculateRelevanceScore(trial, keywords);

        // Only include trials with sufficient relevance
        if (relevanceScore >= 0.3) {
          const processedTrial: ProcessedPublication = {
            pmid: trial.nctId || trial.NCTId || `ct-${Date.now()}`,
            title: trial.briefTitle || trial.BriefTitle || trial.officialTitle || trial.OfficialTitle,
            abstract: this.createTrialAbstract(trial),
            authors: this.extractTrialSponsors(trial),
            journal: "ClinicalTrials.gov",
            publicationDate: this.parseTrialDate(trial.startDate || trial.StartDate),
            doi: undefined, // Clinical trials don't have DOIs
            keywords: this.extractTrialKeywords(trial),
            meshTerms: [], // Clinical trials don't use MeSH terms
            evidenceQuality,
            relevanceScore,
            carePlanMatches: [],
            processedAt: new Date(),
          };

          processed.push(processedTrial);
        }
      } catch (error) {
        console.warn("[Genesis ClinicalTrials] Trial processing error:", error);
      }
    }

    return processed;
  }

  /**
   * Assess quality and evidence value of clinical trials
   */
  private assessTrialQuality(trial: any): EvidenceQualityScore {
    let score = 60; // Moderate base score for clinical trials
    let grade: "A" | "B" | "C" | "D" = "B";

    // Phase assessment - higher phases are more valuable
    const phases = trial.phase || trial.Phase || [];
    if (phases.includes("PHASE3") || phases.includes("PHASE4")) {
      score += 20;
      grade = "A";
    } else if (phases.includes("PHASE2")) {
      score += 10;
    } else if (phases.includes("PHASE1") || phases.includes("EARLY_PHASE1")) {
      score += 5;
    }

    // Study type assessment
    const studyType = trial.studyType || trial.StudyType;
    if (studyType === "INTERVENTIONAL") {
      score += 15; // Interventional studies provide stronger evidence
    } else if (studyType === "OBSERVATIONAL") {
      score += 5;
    }

    // Completion status
    const status = trial.overallStatus || trial.OverallStatus;
    if (status === "COMPLETED") {
      score += 15; // Completed trials have results
      if (trial.resultsAvailable || trial.HasResults) {
        score += 10; // Results available is highly valuable
      }
    } else if (status === "ACTIVE_NOT_RECRUITING") {
      score += 5; // Ongoing but not recruiting
    } else if (status === "RECRUITING") {
      // No penalty, but no bonus for ongoing recruitment
    } else {
      score -= 15; // Terminated, suspended, or withdrawn studies
      grade = "C";
    }

    // Sample size consideration
    const enrollment = trial.enrollment?.count || trial.EnrollmentCount;
    if (enrollment) {
      if (enrollment >= 1000) {
        score += 10; // Large studies are more reliable
      } else if (enrollment >= 100) {
        score += 5;
      } else if (enrollment < 20) {
        score -= 10; // Very small studies are less reliable
      }
    }

    // Masking/blinding assessment
    const masking = trial.masking?.masking;
    if (masking === "DOUBLE" || masking === "TRIPLE" || masking === "QUADRUPLE") {
      score += 10; // Blinded studies reduce bias
    } else if (masking === "SINGLE") {
      score += 5;
    }

    // Sponsor assessment
    const sponsors = trial.sponsors || [];
    const hasNIH = sponsors.some((s: any) => s.class === "NIH" || s.name?.includes("NIH"));
    const hasIndustry = sponsors.some((s: any) => s.class === "INDUSTRY");
    
    if (hasNIH) {
      score += 5; // NIH funding adds credibility
    }
    if (hasIndustry && !hasNIH) {
      score -= 5; // Industry-only funding may introduce bias
    }

    // Recency bonus
    const startDate = new Date(trial.startDate || trial.StartDate || 0);
    const yearsSinceStart = (Date.now() - startDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    
    if (yearsSinceStart <= 2) {
      score += 5; // Recent trials reflect current practice
    } else if (yearsSinceStart > 10) {
      score -= 10; // Older trials may be outdated
    }

    // Adjust grade based on final score
    if (score >= 85) grade = "A";
    else if (score >= 70) grade = "B";
    else if (score >= 50) grade = "C";
    else grade = "D";

    return {
      grade,
      score: Math.max(0, Math.min(100, score)),
      factors: {
        studyDesign: `${studyType || "Clinical Trial"} - ${phases.join(", ") || "Phase not specified"}`,
        sampleSize: enrollment ? `${enrollment} participants` : "Sample size not specified",
        methodology: masking ? `${masking} masking` : "Masking not specified",
        bias: hasNIH ? "Low risk - NIH funded" : hasIndustry ? "Moderate risk - Industry funded" : "Unknown funding",
      },
    };
  }

  /**
   * Calculate relevance score for care plan keywords
   */
  private calculateRelevanceScore(trial: any, keywords: string[]): number {
    let score = 0;
    const title = (trial.briefTitle || trial.BriefTitle || "").toLowerCase();
    const summary = (trial.briefSummary || trial.BriefSummary || "").toLowerCase();
    const conditions = (trial.conditions || trial.Condition || []).join(" ").toLowerCase();
    const interventions = (trial.interventions || trial.InterventionName || []).join(" ").toLowerCase();

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Title matches are highly relevant
      if (title.includes(keywordLower)) {
        score += 0.6;
      }

      // Condition matches are very relevant
      if (conditions.includes(keywordLower)) {
        score += 0.5;
      }

      // Intervention matches are very relevant
      if (interventions.includes(keywordLower)) {
        score += 0.5;
      }

      // Summary matches
      if (summary.includes(keywordLower)) {
        score += 0.3;
      }

      // Primary outcome matches
      const primaryOutcomes = trial.primaryOutcomes || trial.PrimaryOutcomeMeasure || [];
      const outcomeMatches = primaryOutcomes.some((outcome: any) =>
        (outcome.measure || outcome || "").toLowerCase().includes(keywordLower)
      );
      if (outcomeMatches) {
        score += 0.4;
      }
    }

    // Bonus for completed trials with results
    const status = trial.overallStatus || trial.OverallStatus;
    if (status === "COMPLETED" && (trial.resultsAvailable || trial.HasResults)) {
      score += 0.2; // Results available bonus
    }

    // Bonus for higher phase trials
    const phases = trial.phase || trial.Phase || [];
    if (phases.includes("PHASE3") || phases.includes("PHASE4")) {
      score += 0.15;
    } else if (phases.includes("PHASE2")) {
      score += 0.1;
    }

    // Normalize to 0-1 range
    return Math.min(score, 1);
  }

  /**
   * Create abstract from trial information
   */
  private createTrialAbstract(trial: any): string {
    const parts: string[] = [];

    // Brief summary
    if (trial.briefSummary || trial.BriefSummary) {
      parts.push(trial.briefSummary || trial.BriefSummary);
    }

    // Study details
    const status = trial.overallStatus || trial.OverallStatus;
    const studyType = trial.studyType || trial.StudyType;
    const phases = trial.phase || trial.Phase || [];
    const enrollment = trial.enrollment?.count || trial.EnrollmentCount;

    const details: string[] = [];
    if (status) details.push(`Status: ${status}`);
    if (studyType) details.push(`Study Type: ${studyType}`);
    if (phases.length > 0) details.push(`Phase: ${phases.join(", ")}`);
    if (enrollment) details.push(`Enrollment: ${enrollment} participants`);

    if (details.length > 0) {
      parts.push(`Study Details: ${details.join("; ")}.`);
    }

    // Primary outcomes
    const primaryOutcomes = trial.primaryOutcomes || trial.PrimaryOutcomeMeasure;
    if (primaryOutcomes && primaryOutcomes.length > 0) {
      const outcomes = Array.isArray(primaryOutcomes) 
        ? primaryOutcomes.map((o: any) => o.measure || o).slice(0, 3)
        : [primaryOutcomes];
      parts.push(`Primary Outcomes: ${outcomes.join("; ")}.`);
    }

    return parts.join(" ") || "Clinical trial information available.";
  }

  /**
   * Extract sponsor information as authors
   */
  private extractTrialSponsors(trial: any): string[] {
    const sponsors = trial.sponsors || trial.Sponsor;
    if (!sponsors) return ["ClinicalTrials.gov"];

    if (Array.isArray(sponsors)) {
      return sponsors.map((s: any) => s.name || s).slice(0, 5);
    }

    return [sponsors];
  }

  /**
   * Extract keywords from trial data
   */
  private extractTrialKeywords(trial: any): string[] {
    const keywords: string[] = [];

    // Add conditions
    const conditions = trial.conditions || trial.Condition || [];
    if (Array.isArray(conditions)) {
      keywords.push(...conditions.slice(0, 5));
    } else if (conditions) {
      keywords.push(conditions);
    }

    // Add interventions
    const interventions = trial.interventions || trial.InterventionName || [];
    if (Array.isArray(interventions)) {
      interventions.slice(0, 3).forEach((int: any) => {
        if (int.name) keywords.push(int.name);
        else if (typeof int === "string") keywords.push(int);
      });
    } else if (interventions) {
      keywords.push(interventions);
    }

    // Add study type and phase
    const studyType = trial.studyType || trial.StudyType;
    if (studyType) keywords.push(studyType.toLowerCase());

    const phases = trial.phase || trial.Phase || [];
    keywords.push(...phases.map((p: string) => p.toLowerCase()));

    // Remove duplicates and return
    return [...new Set(keywords)].filter(Boolean);
  }

  /**
   * Parse trial date
   */
  private parseTrialDate(dateString: string | undefined): Date {
    if (!dateString) return new Date();
    
    try {
      return new Date(dateString);
    } catch {
      return new Date();
    }
  }

  /**
   * Rate limiting for ClinicalTrials.gov API
   */
  private async rateLimit(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
  }

  /**
   * Get detailed trial information by NCT ID
   */
  async getTrialDetails(nctId: string): Promise<ProcessedPublication | null> {
    try {
      await this.rateLimit();

      const url = `${this.baseUrl}/${nctId}?format=json&fields=NCTId,BriefTitle,OfficialTitle,BriefSummary,DetailedDescription,OverallStatus,Phase,StudyType,PrimaryPurpose,Condition,InterventionName,PrimaryOutcomeMeasure,SecondaryOutcomeMeasure,StartDate,CompletionDate,EnrollmentCount,HasResults,Sponsor,LocationFacility`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Genesis-Agent/1.0 (Medical Research Tool)',
        },
      });

      if (!response.ok) {
        console.warn(`[Genesis ClinicalTrials] Could not fetch details for ${nctId}`);
        return null;
      }

      const trialData = await response.json();
      const processed = await this.processTrials([trialData], []);
      
      return processed[0] || null;

    } catch (error) {
      console.error(`[Genesis ClinicalTrials] Error fetching trial ${nctId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const clinicalTrialsService = new ClinicalTrialsService();