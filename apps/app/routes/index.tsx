import { StatsCard } from "@/components/stats-card";
import { SurgicalTrackingChart } from "@/components/surgical-tracking-chart";
import { auth } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  component: () => {
    const { data: session } = auth.useSession();
    const greeting = (() => {
      const hour = new Date().getHours();
      const firstName = session?.user?.name?.split(" ")[0];
      const nameGreeting = firstName ? `, ${firstName}` : "";
      
      if (hour < 12)
        return `Good morning${nameGreeting}!`;
      if (hour < 18)
        return `Good afternoon${nameGreeting}!`;
      return `Good evening${nameGreeting}!`;
    })();

    return (
      <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
        <div className="text-xl font-semibold text-muted-foreground mb-4">
          {greeting}
        </div>
        <div className="grid gap-4 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 w-full">
          <div className="rounded-xl bg-card p-6 shadow">
            <div className="space-y-4">
              <h3 className="font-semibold text-muted-foreground">
                Priority Tasks
              </h3>
              <ul className="space-y-2">
                {[
                  { id: 1, title: "Review patient charts", priority: "high" },
                  {
                    id: 2,
                    title: "Update treatment plans",
                    priority: "medium",
                  },
                  { id: 3, title: "Schedule follow-ups", priority: "low" },
                ].map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{task.title}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <StatsCard
            title="Preoperative Stats"
            data={[
              { name: "Completed", value: 42, color: "completed" },
              { name: "Pending", value: 18, color: "pending" },
              { name: "Cancelled", value: 5, color: "cancelled" },
            ]}
            total={65}
          />
          <StatsCard
            title="Postoperative Stats"
            data={[
              { name: "Recovered", value: 38, color: "completed" },
              { name: "In Recovery", value: 12, color: "pending" },
              { name: "Complications", value: 3, color: "cancelled" },
            ]}
            total={53}
          />
        </div>
        <SurgicalTrackingChart />
      </div>
    );
  },
});
