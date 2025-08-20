import { createFileRoute } from "@tanstack/react-router";

const currentPlans = [
  {
    name: "Hypertension Management",
    status: "Active",
    lastUpdated: "2024-06-10",
  },
  {
    name: "Diabetes Monitoring",
    status: "Active",
    lastUpdated: "2024-05-28",
  },
];

const suggestedUpdates = [
  {
    plan: "Hypertension Management",
    suggestion:
      "Update BP target to <130/80 mmHg based on 2024 AHA guidelines.",
    evidence: {
      title: "2024 AHA Hypertension Guidelines",
      url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
    },
    status: "pending",
  },
];

const learningFeed = [
  {
    source: "AHA Journal",
    title: "2024 Hypertension Guidelines",
    url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000200",
    date: "2024-06-01",
  },
  {
    source: "NEJM",
    title: "SGLT2 Inhibitors in Diabetes Care",
    url: "https://www.nejm.org/doi/full/10.1056/NEJMra1811737",
    date: "2024-05-20",
  },
];

const auditLog = [
  {
    action: "Suggestion created",
    plan: "Hypertension Management",
    by: "Genesis Agent",
    date: "2024-06-10",
    details: "Suggested BP target update based on new guidelines.",
  },
  {
    action: "Suggestion reviewed",
    plan: "Hypertension Management",
    by: "Dr. Smith",
    date: "2024-06-11",
    details: "Accepted BP target update.",
  },
];

export const Route = createFileRoute("/agents/genesis-agent")({
  component: () => (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <h1 className="text-3xl font-bold mb-4">Genesis Agent</h1>
      <p className="mb-6 text-muted-foreground">
        <strong>Genesis Agent</strong> assists clinicians by suggesting
        evidence-based care plan updates, learning from new guidelines and
        research, and always requiring human review before any plan is changed.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Current Plans</h2>
          <ul className="space-y-2 mb-6">
            {currentPlans.map((plan) => (
              <li
                key={plan.name}
                className="border rounded p-3 bg-card flex justify-between items-center"
              >
                <span>
                  <span className="font-medium">{plan.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({plan.status})
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  Last updated: {plan.lastUpdated}
                </span>
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-semibold mb-2">Suggested Updates</h2>
          <ul className="space-y-2 mb-6">
            {suggestedUpdates.map((s, i) => (
              <li key={i} className="border rounded p-3 bg-card">
                <div className="font-medium mb-1">{s.plan}</div>
                <div className="mb-1">{s.suggestion}</div>
                <div className="text-xs mb-2">
                  Evidence:{" "}
                  <a
                    href={s.evidence.url}
                    className="underline text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.evidence.title}
                  </a>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">
                    Accept
                  </button>
                  <button className="px-3 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">
                    Reject
                  </button>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Status: {s.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Learning Feed</h2>
          <ul className="space-y-2 mb-6">
            {learningFeed.map((item, i) => (
              <li key={i} className="border rounded p-3 bg-card">
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-muted-foreground mb-1">
                  {item.source} &middot; {item.date}
                </div>
                <a
                  href={item.url}
                  className="underline text-blue-600 text-xs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                </a>
              </li>
            ))}
          </ul>
          <h2 className="text-xl font-semibold mb-2">Audit Log</h2>
          <ul className="space-y-2">
            {auditLog.map((log, i) => (
              <li key={i} className="border rounded p-3 bg-card">
                <div className="font-medium mb-1">
                  {log.action} - {log.plan}
                </div>
                <div className="text-xs text-muted-foreground mb-1">
                  {log.date} by {log.by}
                </div>
                <div className="text-xs">{log.details}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-2">
          Example Suggestion &amp; Flow
        </h2>
        <div className="mb-4">
          <div className="font-semibold mb-2">Example: BP Target Update</div>
          <ol className="list-decimal list-inside text-muted-foreground mb-6 space-y-1">
            <li>Genesis Agent ingests new AHA hypertension guidelines.</li>
            <li>
              Detects that BP target in "Hypertension Management" plan is
              outdated.
            </li>
            <li>Suggests update to &lt;130/80 mmHg, citing the guideline.</li>
            <li>Clinician reviews and accepts the suggestion.</li>
            <li>Plan is updated and audit log is recorded.</li>
          </ol>
          <h3 className="font-semibold mb-2">Genesis Agent Flow</h3>
          <div className="max-w-4xl">
            <div className="bg-white border rounded p-6 overflow-x-auto">
              <svg viewBox="0 0 800 600" className="w-full h-auto">
                {/* Background */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                   refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
                  </marker>
                </defs>
                
                {/* Start Node */}
                <rect x="50" y="20" width="200" height="60" rx="30" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                <text x="150" y="45" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Genesis Agent</text>
                <text x="150" y="60" textAnchor="middle" fill="white" fontSize="10">Observes New Evidence</text>
                
                {/* Decision Diamond */}
                <polygon points="150,120 220,150 150,180 80,150" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
                <text x="150" y="145" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">Relevant to</text>
                <text x="150" y="160" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">existing plan?</text>
                
                {/* Update Plan */}
                <rect x="320" y="120" width="120" height="60" rx="10" fill="#10B981" stroke="#059669" strokeWidth="2"/>
                <text x="380" y="145" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Suggest</text>
                <text x="380" y="160" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Update Plan</text>
                
                {/* New Plan */}
                <rect x="480" y="120" width="120" height="60" rx="10" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
                <text x="540" y="145" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Suggest</text>
                <text x="540" y="160" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">New Plan</text>
                
                {/* Clinician Review */}
                <rect x="350" y="240" width="160" height="60" rx="10" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
                <text x="430" y="265" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Clinician Review</text>
                <text x="430" y="280" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">& Decision</text>
                
                {/* Accept Path */}
                <rect x="200" y="360" width="140" height="60" rx="10" fill="#059669" stroke="#047857" strokeWidth="2"/>
                <text x="270" y="385" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Plan Updated</text>
                <text x="270" y="400" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">(by Human)</text>
                
                {/* Reject Path */}
                <rect x="460" y="360" width="140" height="60" rx="10" fill="#6B7280" stroke="#4B5563" strokeWidth="2"/>
                <text x="530" y="385" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">No Change</text>
                <text x="530" y="400" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Made</text>
                
                {/* Audit Log */}
                <rect x="300" y="480" width="160" height="60" rx="10" fill="#6366F1" stroke="#4F46E5" strokeWidth="2"/>
                <text x="380" y="505" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Audit Log</text>
                <text x="380" y="520" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Who/When/Why</text>
                
                {/* Learning */}
                <rect x="620" y="240" width="120" height="60" rx="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2"/>
                <text x="680" y="265" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Genesis</text>
                <text x="680" y="280" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">Learns</text>
                
                {/* Arrows */}
                <line x1="150" y1="80" x2="150" y2="120" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                <line x1="220" y1="150" x2="320" y2="150" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="270" y="145" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">Yes</text>
                
                <line x1="150" y1="180" x2="150" y2="200" stroke="#374151" strokeWidth="2"/>
                <line x1="150" y1="200" x2="540" y2="200" stroke="#374151" strokeWidth="2"/>
                <line x1="540" y1="200" x2="540" y2="180" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="350" y="195" textAnchor="middle" fill="#8B5CF6" fontSize="10" fontWeight="bold">No</text>
                
                <line x1="380" y1="180" x2="380" y2="200" stroke="#374151" strokeWidth="2"/>
                <line x1="380" y1="200" x2="430" y2="200" stroke="#374151" strokeWidth="2"/>
                <line x1="430" y1="200" x2="430" y2="240" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                <line x1="540" y1="180" x2="540" y2="200" stroke="#374151" strokeWidth="2"/>
                <line x1="540" y1="200" x2="430" y2="200" stroke="#374151" strokeWidth="2"/>
                
                <line x1="380" y1="300" x2="270" y2="360" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="320" y="335" textAnchor="middle" fill="#059669" fontSize="10" fontWeight="bold">Accept</text>
                
                <line x1="480" y1="300" x2="530" y2="360" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="510" y="335" textAnchor="middle" fill="#6B7280" fontSize="10" fontWeight="bold">Reject</text>
                
                <line x1="270" y1="420" x2="270" y2="450" stroke="#374151" strokeWidth="2"/>
                <line x1="270" y1="450" x2="380" y2="450" stroke="#374151" strokeWidth="2"/>
                <line x1="380" y1="450" x2="380" y2="480" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
                <line x1="530" y1="420" x2="530" y2="450" stroke="#374151" strokeWidth="2"/>
                <line x1="530" y1="450" x2="380" y2="450" stroke="#374151" strokeWidth="2"/>
                
                <line x1="510" y1="270" x2="620" y2="270" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
});