import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { createFileRoute } from "@tanstack/react-router";

// Placeholder data for demonstration
const blueprintPlans = [
  {
    name: "Total Knee Arthroplasty (Preoperative)",
    procedure: "Total Knee Arthroplasty (TKA)",
    phase: "Preoperative",
    owner: "Sophia",
    lastUpdated: "06/10/2024",
  },
  {
    name: "Coronary Artery Bypass Graft (Postoperative)",
    procedure: "Coronary Artery Bypass Graft (CABG)",
    phase: "Postoperative",
    owner: "Sophia",
    lastUpdated: "06/08/2024",
  },
  {
    name: "Laparoscopic Cholecystectomy (Preoperative)",
    procedure: "Laparoscopic Cholecystectomy",
    phase: "Preoperative",
    owner: "Sophia",
    lastUpdated: "05/28/2024",
  },
];

const organizationPlans = [
  {
    name: "Total Knee Arthroplasty (Preoperative)",
    procedure: "Total Knee Arthroplasty (TKA)",
    phase: "Preoperative",
    owner: "Midwest Health",
    lastUpdated: "06/11/2024",
  },
  {
    name: "Coronary Artery Bypass Graft (Postoperative)",
    procedure: "Coronary Artery Bypass Graft (CABG)",
    phase: "Postoperative",
    owner: "Midwest Health",
    lastUpdated: "06/09/2024",
  },
  {
    name: "Laparoscopic Cholecystectomy (Preoperative)",
    procedure: "Laparoscopic Cholecystectomy",
    phase: "Preoperative",
    owner: "Midwest Health",
    lastUpdated: "05/30/2024",
  },
];

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function CarePlanTable({
  label,
  plans,
}: {
  label: string;
  plans: typeof blueprintPlans;
}) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-2 mt-8">{label}</h2>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Procedure</TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan, idx) => (
              <TableRow key={plan.name + plan.owner + idx}>
                <TableCell>{plan.name}</TableCell>
                <TableCell>{plan.procedure}</TableCell>
                <TableCell>{plan.phase}</TableCell>
                <TableCell>{plan.owner}</TableCell>
                <TableCell>{plan.lastUpdated}</TableCell>
                <TableCell>
                  <a
                    href={`/care-plans/${slugify(plan.name)}`}
                    className="text-blue-600 underline"
                  >
                    View Plan
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Mobile Card Stack */}
      <div className="block md:hidden space-y-4">
        {plans.map((plan, idx) => (
          <Card key={plan.name + plan.owner + idx}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-1">
                <span className="font-semibold">Procedure: </span>
                {plan.procedure}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Phase: </span>
                {plan.phase}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Owner: </span>
                {plan.owner}
              </div>
              <div className="mb-1">
                <span className="font-semibold">Last Updated: </span>
                {plan.lastUpdated}
              </div>
            </CardContent>
            <CardFooter>
              <a
                href={`/care-plans/${slugify(plan.name)}`}
                className="text-blue-600 underline font-medium"
              >
                View Plan
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/care-plans")({
  component: () => (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <h1 className="text-3xl font-bold mb-4">Care Plans Library</h1>
      <div className="mb-4 text-base text-muted-foreground">
        This page lists the library of care plan blueprints maintained by
        Sophia, as well as plans customized by your organization. Use these as
        starting points for patient care, and see how your organization’s
        standards build on Sophia’s evidence-based blueprints.
      </div>
      <CarePlanTable label="Sophia Blueprints" plans={blueprintPlans} />
      <CarePlanTable label="Midwest Health Plans" plans={organizationPlans} />
    </div>
  ),
});
