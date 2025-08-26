/**
 * OpenAI-powered analysis and synthesis for Genesis Agent
 * 
 * Provides AI-driven analysis of medical literature, evidence synthesis,
 * and clinical recommendation generation using GPT-4.
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { generateObject, generateText } from "ai";
import { z } from "zod";
import type { ProcessedPublication } from "./genesis-pubmed";
import { getOpenAI } from "./ai";
import type { Env } from "./env";

// Schemas for structured AI responses
const ClinicalInsightSchema = z.object({
  keyFindings: z.array(z.string()).describe("Primary clinical findings from the literature"),
  practiceChangingInsights: z.array(z.object({
    finding: z.string(),
    clinicalImplication: z.string(),
    strengthOfEvidence: z.enum(["strong", "moderate", "weak"]),
    implementationComplexity: z.enum(["low", "medium", "high"])
  })).describe("Findings that could change clinical practice"),
  controversies: z.array(z.object({
    topic: z.string(),
    conflictingEvidence: z.string(),
    clinicalGuidance: z.string()
  })).describe("Areas of conflicting evidence or controversy"),
  recommendationsForCarePlans: z.array(z.object({
    recommendation: z.string(),
    rationale: z.string(),
    carePlanType: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    evidenceLevel: z.enum(["A", "B", "C", "D"])
  })).describe("Specific recommendations for updating care plans"),
  safetyConsiderations: z.array(z.string()).describe("Important safety considerations or warnings"),
  qualityOfEvidence: z.object({
    overallRating: z.enum(["high", "moderate", "low", "very-low"]),
    limitations: z.array(z.string()),
    strengthsOfEvidence: z.array(z.string())
  }).describe("Assessment of the overall quality of evidence")
});

const RecommendationSynthesisSchema = z.object({
  title: z.string().describe("Clear, actionable title for the recommendation"),
  summary: z.string().describe("Executive summary of the recommendation"),
  clinicalRationale: z.string().describe("Clinical reasoning behind the recommendation"),
  evidenceSummary: z.string().describe("Summary of supporting evidence"),
  implementationSteps: z.array(z.object({
    step: z.string(),
    timeframe: z.string(),
    responsible: z.string(),
    resources: z.array(z.string())
  })).describe("Step-by-step implementation plan"),
  expectedOutcomes: z.array(z.string()).describe("Expected clinical outcomes"),
  riskMitigation: z.array(z.object({
    risk: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    mitigation: z.string()
  })).describe("Potential risks and mitigation strategies"),
  measurementMetrics: z.array(z.string()).describe("How to measure success of implementation"),
  contraindications: z.array(z.string()).describe("When not to apply this recommendation"),
  costBenefitConsiderations: z.string().describe("Economic and resource considerations")
});

export type ClinicalInsights = z.infer<typeof ClinicalInsightSchema>;
export type RecommendationSynthesis = z.infer<typeof RecommendationSynthesisSchema>;

export class GenesisAIAnalyzer {
  constructor(
    private env: Env,
    private cache?: Map<string | symbol, unknown>
  ) {}

  /**
   * Analyze a collection of medical publications to extract clinical insights
   */
  async analyzeEvidence(publications: ProcessedPublication[]): Promise<ClinicalInsights> {
    if (publications.length === 0) {
      throw new Error("No publications provided for analysis");
    }

    const openai = getOpenAI(this.env, this.cache);

    // Prepare literature summary for AI analysis
    const literatureSummary = publications.map(pub => ({
      title: pub.title,
      journal: pub.journal,
      publicationDate: pub.publicationDate.getFullYear(),
      abstract: pub.abstract?.substring(0, 500), // Limit to avoid token limits
      evidenceQuality: pub.evidenceQuality.grade,
      relevanceScore: pub.relevanceScore,
      meshTerms: pub.meshTerms.slice(0, 5) // Top 5 MeSH terms
    }));

    console.log(`[Genesis AI] Analyzing ${publications.length} publications`);

    try {
      const result = await generateObject({
        model: openai("gpt-4-turbo"),
        schema: ClinicalInsightSchema,
        prompt: `
As a clinical evidence analyst, analyze this medical literature and provide comprehensive insights.

LITERATURE COLLECTION (${publications.length} publications):
${JSON.stringify(literatureSummary, null, 2)}

Provide a thorough clinical analysis focusing on:

1. KEY CLINICAL FINDINGS: What are the most important clinical insights from this literature?

2. PRACTICE-CHANGING INSIGHTS: Which findings could significantly change clinical practice? 
   - Consider strength of evidence, clinical impact, and implementation feasibility
   - Rate each insight's evidence strength and implementation complexity

3. CONTROVERSIES & CONFLICTS: Are there any conflicting findings or ongoing debates?
   - Highlight areas where evidence conflicts
   - Provide guidance on navigating controversies

4. CARE PLAN RECOMMENDATIONS: What specific changes should be made to care plans?
   - Prioritize recommendations by clinical impact
   - Assign evidence levels using standard medical evidence grading
   - Consider different types of care plans (acute, chronic, preventive, etc.)

5. SAFETY CONSIDERATIONS: Any important safety warnings or contraindications?

6. EVIDENCE QUALITY: Overall assessment of the evidence quality and limitations

Focus on actionable insights that can directly improve patient care. Consider real-world implementation challenges and provide practical guidance for clinicians.
        `,
        temperature: 0.3, // Lower temperature for more consistent medical analysis
      });

      console.log(`[Genesis AI] Analysis completed for ${publications.length} publications`);
      return result.object;

    } catch (error) {
      console.error("[Genesis AI] Analysis failed:", error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generate detailed recommendation synthesis for care plan updates
   */
  async synthesizeRecommendation(
    insights: ClinicalInsights,
    carePlanContext: {
      carePlanTitle: string;
      currentGuidelines: string;
      patientPopulation: string;
      currentOutcomes?: string;
    }
  ): Promise<RecommendationSynthesis> {
    const openai = getOpenAI(this.env, this.cache);

    console.log(`[Genesis AI] Synthesizing recommendation for: ${carePlanContext.carePlanTitle}`);

    try {
      const result = await generateObject({
        model: openai("gpt-4-turbo"),
        schema: RecommendationSynthesisSchema,
        prompt: `
As a clinical guidelines expert, create a comprehensive recommendation for updating a care plan based on new evidence.

CARE PLAN CONTEXT:
- Care Plan: ${carePlanContext.carePlanTitle}
- Current Guidelines: ${carePlanContext.currentGuidelines}
- Patient Population: ${carePlanContext.patientPopulation}
- Current Outcomes: ${carePlanContext.currentOutcomes || "Not specified"}

EVIDENCE INSIGHTS:
${JSON.stringify(insights, null, 2)}

Create a detailed, actionable recommendation that includes:

1. CLEAR TITLE: Specific, actionable title for this recommendation

2. EXECUTIVE SUMMARY: Brief overview of what needs to change and why

3. CLINICAL RATIONALE: Detailed medical reasoning for this recommendation
   - Why is this change needed?
   - What clinical problem does it address?
   - How does it improve patient outcomes?

4. EVIDENCE SUMMARY: Synthesis of the supporting literature
   - Strength and quality of evidence
   - Key studies or guidelines supporting the change

5. IMPLEMENTATION PLAN: Step-by-step plan with:
   - Specific actions required
   - Timeline for implementation
   - Responsible parties (roles, not names)
   - Required resources (staff, equipment, training)

6. EXPECTED OUTCOMES: What improvements should be expected?
   - Clinical outcomes
   - Quality metrics
   - Patient satisfaction
   - Cost considerations

7. RISK ASSESSMENT: Potential risks and how to mitigate them
   - Implementation risks
   - Clinical risks
   - Resource risks

8. SUCCESS METRICS: How to measure if the recommendation is working
   - Clinical indicators
   - Process measures
   - Patient-reported outcomes

9. CONTRAINDICATIONS: When NOT to apply this recommendation
   - Patient populations to exclude
   - Clinical situations where caution is needed

10. COST-BENEFIT: Economic and resource implications
    - Implementation costs
    - Ongoing resource needs
    - Expected return on investment

Make this recommendation specific, actionable, and ready for clinical review and approval.
        `,
        temperature: 0.2, // Very low temperature for consistent recommendations
      });

      console.log(`[Genesis AI] Recommendation synthesis completed for: ${carePlanContext.carePlanTitle}`);
      return result.object;

    } catch (error) {
      console.error("[Genesis AI] Recommendation synthesis failed:", error);
      throw new Error(`Recommendation synthesis failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Generate a concise summary of multiple recommendations for executive review
   */
  async generateExecutiveSummary(
    recommendations: RecommendationSynthesis[],
    organizationContext?: string
  ): Promise<string> {
    if (recommendations.length === 0) {
      return "No recommendations available for summary.";
    }

    const openai = getOpenAI(this.env, this.cache);

    console.log(`[Genesis AI] Generating executive summary for ${recommendations.length} recommendations`);

    try {
      const result = await generateText({
        model: openai("gpt-4-turbo"),
        prompt: `
Create an executive summary for healthcare leadership reviewing Genesis Agent recommendations.

ORGANIZATION CONTEXT: ${organizationContext || "Healthcare organization"}

RECOMMENDATIONS TO SUMMARIZE (${recommendations.length} total):
${recommendations.map((rec, idx) => `
${idx + 1}. ${rec.title}
   Summary: ${rec.summary}
   Priority: Based on ${rec.implementationSteps.length} implementation steps
   Expected Outcomes: ${rec.expectedOutcomes.slice(0, 2).join(", ")}
   Key Risks: ${rec.riskMitigation.map(r => r.risk).slice(0, 2).join(", ")}
`).join("\n")}

Create a concise executive summary (500-750 words) that includes:

1. OVERVIEW: Brief summary of the Genesis Agent's findings and recommendations

2. KEY RECOMMENDATIONS: Top 3-5 most impactful recommendations with priority ranking

3. STRATEGIC IMPACT: How these changes align with organizational goals and quality initiatives

4. RESOURCE REQUIREMENTS: High-level summary of implementation resources needed

5. TIMELINE: Suggested prioritization and timeline for implementation

6. RISK CONSIDERATIONS: Major risks and mitigation strategies

7. EXPECTED ROI: Clinical and financial benefits expected

8. NEXT STEPS: Recommended actions for leadership

Write for a C-suite healthcare audience focused on quality, safety, and organizational performance.
        `,
        temperature: 0.3,
      });

      console.log(`[Genesis AI] Executive summary generated for ${recommendations.length} recommendations`);
      return result.text;

    } catch (error) {
      console.error("[Genesis AI] Executive summary generation failed:", error);
      throw new Error(`Executive summary generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Assess clinical relevance of literature to specific care plans
   */
  async assessRelevanceToCarePlans(
    publication: ProcessedPublication,
    carePlans: Array<{ id: string; title: string; description: string; keywords: string[] }>
  ): Promise<Array<{ carePlanId: string; relevanceScore: number; rationale: string }>> {
    if (carePlans.length === 0) {
      return [];
    }

    const openai = getOpenAI(this.env, this.cache);

    try {
      const result = await generateText({
        model: openai("gpt-4-turbo"),
        prompt: `
Assess the clinical relevance of this publication to specific care plans.

PUBLICATION:
Title: ${publication.title}
Abstract: ${publication.abstract || "No abstract available"}
Journal: ${publication.journal}
MeSH Terms: ${publication.meshTerms.join(", ")}
Evidence Quality: ${publication.evidenceQuality.grade}

CARE PLANS TO ASSESS:
${carePlans.map(cp => `
ID: ${cp.id}
Title: ${cp.title}
Description: ${cp.description}
Keywords: ${cp.keywords.join(", ")}
`).join("\n")}

For each care plan, provide:
1. Relevance score (0-100)
2. Brief rationale for the score

Format as JSON array:
[
  {
    "carePlanId": "plan-id",
    "relevanceScore": 85,
    "rationale": "Direct relevance because..."
  }
]

Only include care plans with relevance scores ≥ 30.
        `,
        temperature: 0.2,
      });

      // Parse JSON response
      const assessments = JSON.parse(result.text);
      
      console.log(`[Genesis AI] Assessed relevance for ${assessments.length} care plans`);
      return assessments;

    } catch (error) {
      console.error("[Genesis AI] Relevance assessment failed:", error);
      // Return empty array on error rather than failing completely
      return [];
    }
  }
}

// Export singleton factory
export function createGenesisAIAnalyzer(env: Env, cache?: Map<string | symbol, unknown>) {
  return new GenesisAIAnalyzer(env, cache);
}