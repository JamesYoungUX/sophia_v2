import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import React from "react";
import { Button } from "@repo/ui";

// Mock findings data - TODO: Replace with actual findings from API
const mockFindings = {
  "2024-08": [
    {
      carePlanId: "cp-1",
      carePlanTitle: "Hypertension Management",
      findings: [
        {
          id: "f-1",
          title: "Updated ACC/AHA Guidelines for Hypertension Management",
          source: "American Heart Association",
          sourceType: "guidelines",
          date: "2024-08-15",
          evidenceGrade: "A",
          relevanceScore: 0.92,
          summary: "New recommendations for blood pressure targets in elderly patients",
          url: "https://www.heart.org/guidelines/hypertension-2024",
          status: "pending_cmo_review",
          critical: false,
        },
        {
          id: "f-2", 
          title: "Systematic Review: ACE Inhibitors vs ARBs in Diabetic Hypertension",
          source: "Cochrane Library",
          sourceType: "systematic-review",
          date: "2024-08-10",
          evidenceGrade: "A",
          relevanceScore: 0.87,
          summary: "Meta-analysis of 23 RCTs comparing effectiveness in diabetic patients",
          url: "https://cochranelibrary.com/review-ace-arb",
          status: "cmo_approved",
          critical: false,
        }
      ]
    },
    {
      carePlanId: "cp-2",
      carePlanTitle: "Diabetes Type 2 Care",
      findings: [
        {
          id: "f-3",
          title: "SGLT2 Inhibitor Safety Alert: Kidney Function Monitoring",
          source: "FDA",
          sourceType: "guidelines",
          date: "2024-08-20",
          evidenceGrade: "A",
          relevanceScore: 0.95,
          summary: "Updated monitoring requirements for SGLT2 inhibitors",
          url: "https://fda.gov/alerts/sglt2-monitoring",
          status: "critical_review",
          critical: true,
        },
        {
          id: "f-4",
          title: "Phase 3 Trial: Tirzepatide in Type 2 Diabetes",
          source: "ClinicalTrials.gov",
          sourceType: "clinical-trial",
          date: "2024-08-05",
          evidenceGrade: "B",
          relevanceScore: 0.83,
          summary: "Completed trial showing superior glycemic control vs standard care",
          url: "https://clinicaltrials.gov/study/NCT05123456",
          status: "org_review",
          critical: false,
        }
      ]
    },
    {
      carePlanId: "cp-3", 
      carePlanTitle: "Heart Failure Management",
      findings: [
        {
          id: "f-5",
          title: "AI Analysis: Heart Failure Medication Interactions",
          source: "Genesis AI",
          sourceType: "ai-synthesis",
          date: "2024-08-12",
          evidenceGrade: "B",
          relevanceScore: 0.79,
          summary: "Synthesis of 15 studies identifying potential medication interactions",
          url: "#",
          status: "pending_cmo_review",
          critical: false,
        }
      ]
    }
  ]
};

type FindingStatus = "pending_cmo_review" | "cmo_approved" | "org_review" | "critical_review" | "implemented" | "rejected";

function getStatusBadge(status: FindingStatus, critical: boolean) {
  if (critical) {
    return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">🚨 CRITICAL</span>;
  }
  
  switch (status) {
    case "pending_cmo_review":
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Pending CMO Review</span>;
    case "cmo_approved":
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">CMO Approved</span>;
    case "org_review":
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">Organization Review</span>;
    case "critical_review":
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">Critical Review</span>;
    case "implemented":
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">✓ Implemented</span>;
    case "rejected":
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">✗ Rejected</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">Unknown</span>;
  }
}

function getSourceBadge(sourceType: string) {
  switch (sourceType) {
    case "research":
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">📄 Research</span>;
    case "systematic-review":
      return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full">📊 Review</span>;
    case "guidelines":
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">📋 Guidelines</span>;
    case "clinical-trial":
      return <span className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-full">🧪 Trial</span>;
    case "ai-synthesis":
      return <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full">🤖 AI</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">📖 Source</span>;
  }
}

function GenesisMonthlyFindingsPage() {
  const { month } = Route.useParams();
  const findings = mockFindings[month as keyof typeof mockFindings] || [];
  
  const totalFindings = findings.reduce((total, carePlan) => total + carePlan.findings.length, 0);
  const criticalFindings = findings.reduce(
    (total, carePlan) => total + carePlan.findings.filter(f => f.critical).length, 
    0
  );

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Genesis Findings - {formatMonth(month)}</h1>
          <p className="text-muted-foreground">
            Literature findings and recommendations discovered during automated monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
            MOCK DATA
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-2xl font-bold text-blue-600">{totalFindings}</div>
          <div className="text-sm text-muted-foreground">Total Findings</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-2xl font-bold text-red-600">{criticalFindings}</div>
          <div className="text-sm text-muted-foreground">Critical Findings</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-2xl font-bold text-green-600">{findings.length}</div>
          <div className="text-sm text-muted-foreground">Care Plans Affected</div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((totalFindings / findings.length) * 10) / 10 || 0}
          </div>
          <div className="text-sm text-muted-foreground">Avg per Plan</div>
        </div>
      </div>

      {/* Findings by Care Plan */}
      <div className="space-y-6">
        {findings.map((carePlan) => (
          <div key={carePlan.carePlanId} className="border rounded-lg">
            <div className="p-4 border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{carePlan.carePlanTitle}</h2>
                <span className="text-sm text-muted-foreground">
                  {carePlan.findings.length} findings
                </span>
              </div>
            </div>
            <div className="divide-y">
              {carePlan.findings.map((finding) => (
                <div key={finding.id} className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{finding.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{finding.summary}</p>
                      <div className="flex items-center gap-2 mb-2">
                        {getSourceBadge(finding.sourceType)}
                        <span className="text-xs text-muted-foreground">
                          {finding.source} • {finding.date}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          finding.evidenceGrade === 'A' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          Grade {finding.evidenceGrade}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(finding.relevanceScore * 100)}% relevant
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(finding.status as FindingStatus, finding.critical)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {finding.url !== '#' ? (
                        <a
                          href={finding.url}
                          className="text-blue-600 hover:underline text-sm"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Source →
                        </a>
                      ) : (
                        <span className="text-gray-500 text-sm">Internal Analysis</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {finding.status === 'cmo_approved' && (
                        <Button variant="default" size="sm">
                          Review for Implementation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {findings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium mb-2">No findings for {formatMonth(month)}</h3>
          <p>Genesis Agent hasn't discovered any significant literature for this period.</p>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/genesis-findings/$month")({
  beforeLoad: requireAuth,
  component: GenesisMonthlyFindingsPage,
});