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
import { Badge } from "@repo/ui/components/badge";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { api } from "@/lib/trpc";

// Helper function to calculate age from birth date
function calculateAge(birthDate: Date | null): number {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper function to format date
function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function getRiskBadgeVariant(riskLevel: string) {
  switch (riskLevel) {
    case "High":
      return "destructive";
    case "Medium":
      return "secondary";
    case "Low":
      return "outline";
    default:
      return "outline";
  }
}

function PatientPoolTable() {
  const { data: patients, isLoading, error } = api.patient.list.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Patient Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading patients...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Patient Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Error loading patients: {error.message}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const patientPoolData = patients || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Patient Pool</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Primary Condition</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Next Appointment</TableHead>
              <TableHead>Primary Provider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patientPoolData.map((patient) => {
              const fullName = `${patient.lastName || ''}, ${patient.firstName || ''}`;
              const birthDate = patient.birthDate ? new Date(patient.birthDate) : null;
              const age = calculateAge(birthDate);
              const formattedDob = formatDate(birthDate);
              
              return (
                <TableRow key={patient.patId}>
                  <TableCell className="font-medium">{patient.patId}</TableCell>
                  <TableCell>
                    <div>
                      <div>
                        <span className="font-semibold">{patient.lastName || 'Unknown'}</span>
                        {patient.firstName && `, ${patient.firstName}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        DOB: {formattedDob} • Age: {age}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant("Low")}>
                      Low
                    </Badge>
                  </TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                  <TableCell>N/A</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Showing {patientPoolData.length} patients in active pool
        </div>
      </CardFooter>
    </Card>
  );
}

export const Route = createFileRoute("/patient-pool")({
  beforeLoad: requireAuth,
  component: () => (
    <div className="flex flex-1 flex-col gap-4 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      <h1 className="text-3xl font-bold mb-4">Patient Pool</h1>
      <div className="mb-4 text-base text-muted-foreground">
        Monitor and manage your active patient pool. Track patient risk levels,
        upcoming appointments, and care coordination across your healthcare team.
        This centralized view helps ensure no patient falls through the cracks.
      </div>
      <PatientPoolTable />
    </div>
  ),
});