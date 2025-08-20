import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";

const complianceTodos = [
  {
    title: "Design and implement the Compliance Agent",
    description:
      "An automated agent that monitors patient data for care plan adherence (e.g., daily blood pressure reporting), checks for exceptions (hospitalized or deceased), notifies patients of missed actions, and escalates to care providers if non-compliance exceeds a threshold.",
  },
  {
    title: "Extend the Compliance Agent",
    description:
      "Support additional compliance checks (e.g., medication adherence, appointment attendance) and make it easily configurable for new care plan rules.",
  },
  {
    title: "Decide and implement scheduling",
    description:
      "Decide and implement whether the Compliance Agent should run on a schedule (e.g., nightly) or in real-time as data comes in.",
  },
  {
    title: "Design and implement notification/escalation system",
    description:
      "Design and implement the notification/escalation system for the Compliance Agent (patient reminders, provider alerts, audit logging).",
  },
];

export const Route = createFileRoute("/agents/compliance-agent")({
  beforeLoad: requireAuth,
  component: () => (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <h1 className="text-3xl font-bold mb-4">Compliance Agent</h1>
      <p className="mb-6 text-muted-foreground">
        <strong>Note:</strong> The Compliance Agent is one part of a much larger
        patient care Plan, responsible for monitoring and escalating specific
        compliance events.
      </p>
      <ul className="space-y-4">
        {complianceTodos.map((todo) => (
          <li key={todo.title} className="border rounded p-4 bg-card">
            <div className="font-semibold mb-1">{todo.title}</div>
            <div className="text-muted-foreground text-sm">
              {todo.description}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-2">
          Example: Daily Blood Pressure Monitoring
        </h2>
        <ol className="list-decimal list-inside text-muted-foreground mb-6 space-y-1">
          <li>If BP is not reported today, send a reminder to the patient.</li>
          <li>
            If not reported in 3 days, check admissions/discharges/transfers
            (ADT).
          </li>
          <li>
            If patient is on ADT: Send ADT notice (high priority) to case manager.
            <br />
            If patient is not on ADT: Send missed BP note (medium priority) to care exceptions.
          </li>
        </ol>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Compliance Agent Flow</h3>
          <div style={{ maxWidth: "500px", margin: 0 }}>
            <img
              src="/Compliance agent flow.svg"
              alt="Compliance Agent Flow Diagram"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        </div>
      </div>
    </div>
  ),
});