import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { AlertTriangle, Clock, User, Calendar, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/care-exceptions")({
  beforeLoad: requireAuth,
  component: InterventionsPage,
});

// Placeholder data for surgical cases with issues
const interventionCases = [
  {
    id: "CASE-001",
    patientName: "Sarah Johnson",
    patientId: "PT-2024-001",
    surgeryType: "Cardiac Bypass",
    phase: "Pre-Op",
    issue: "Missing lab results",
    severity: "high",
    assignedTo: "Dr. Smith",
    dueDate: "2024-01-15",
    daysPending: 3,
    status: "pending"
  },
  {
    id: "CASE-002",
    patientName: "Michael Chen",
    patientId: "PT-2024-002",
    surgeryType: "Hip Replacement",
    phase: "Post-Op",
    issue: "Delayed recovery assessment",
    severity: "medium",
    assignedTo: "Nurse Williams",
    dueDate: "2024-01-16",
    daysPending: 1,
    status: "in-progress"
  },
  {
    id: "CASE-003",
    patientName: "Emily Rodriguez",
    patientId: "PT-2024-003",
    surgeryType: "Appendectomy",
    phase: "Pre-Op",
    issue: "Insurance authorization pending",
    severity: "high",
    assignedTo: "Case Manager Jones",
    dueDate: "2024-01-14",
    daysPending: 5,
    status: "escalated"
  },
  {
    id: "CASE-004",
    patientName: "Robert Taylor",
    patientId: "PT-2024-004",
    surgeryType: "Knee Arthroscopy",
    phase: "Post-Op",
    issue: "Pain management protocol review",
    severity: "low",
    assignedTo: "Dr. Anderson",
    dueDate: "2024-01-17",
    daysPending: 2,
    status: "pending"
  },
  {
    id: "CASE-005",
    patientName: "Lisa Thompson",
    patientId: "PT-2024-005",
    surgeryType: "Gallbladder Removal",
    phase: "Pre-Op",
    issue: "Anesthesia consultation required",
    severity: "medium",
    assignedTo: "Dr. Martinez",
    dueDate: "2024-01-18",
    daysPending: 1,
    status: "pending"
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "escalated":
      return "bg-red-100 text-red-800 border-red-200";
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

function InterventionsPage() {
  const { data: session } = auth.useSession();
  
  const handleAction = (caseId: string, action: string) => {
    console.log(`Action: ${action} for case: ${caseId}`);
    // TODO: Implement actual case management actions
  };

  const stats = {
    totalCases: interventionCases.length,
    highPriority: interventionCases.filter(c => c.severity === "high").length,
    overdue: interventionCases.filter(c => c.daysPending > 3).length,
    inProgress: interventionCases.filter(c => c.status === "in-progress").length
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Care Exceptions</h1>
        <p className="text-muted-foreground">
          Address exceptional cases in patient surgical care with compassion
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              Active intervention cases
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being addressed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Intervention Cases</CardTitle>
          <CardDescription>
            Surgical pre-op and post-op cases requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Surgery</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interventionCases.map((case_) => (
                <TableRow key={case_.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{case_.patientName}</span>
                      <span className="text-sm text-muted-foreground">{case_.patientId}</span>
                    </div>
                  </TableCell>
                  <TableCell>{case_.surgeryType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={case_.phase === "Pre-Op" ? "border-blue-200 text-blue-800" : "border-purple-200 text-purple-800"}>
                      {case_.phase}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm">{case_.issue}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(case_.severity)}>
                      {case_.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(case_.status)}>
                      {case_.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{case_.assignedTo}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{case_.dueDate}</span>
                      <span className="text-xs text-muted-foreground">
                        {case_.daysPending} days pending
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(case_.id, "view")}
                      >
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleAction(case_.id, "resolve")}
                      >
                        Resolve
                      </Button>
                      {case_.severity === "high" && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleAction(case_.id, "escalate")}
                        >
                          Escalate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}