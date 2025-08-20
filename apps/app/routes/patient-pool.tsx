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

// Placeholder data for demonstration
const patientPoolData = [
  {
    id: "P001",
    name: "Johnson, Sarah",
    dob: "03/15/1958",
    age: 67,
    condition: "Hypertension",
    riskLevel: "Medium",
    lastVisit: "2025-06-10",
    nextAppointment: "2025-08-24",
    primaryProvider: "Dr. Smith",
  },
  {
    id: "P002",
    name: "Chen, Michael",
    dob: "08/22/1970",
    age: 54,
    condition: "Diabetes Type 2",
    riskLevel: "High",
    lastVisit: "2025-06-08",
    nextAppointment: "2025-08-25",
    primaryProvider: "Dr. Johnson",
  },
  {
    id: "P003",
    name: "Rodriguez, Emily",
    dob: "11/07/1982",
    age: 42,
    condition: "Asthma",
    riskLevel: "Low",
    lastVisit: "2025-05-28",
    nextAppointment: "2025-09-02",
    primaryProvider: "Dr. Williams",
  },
  {
    id: "P004",
    name: "Thompson, Robert",
    dob: "01/30/1954",
    age: 71,
    condition: "Heart Disease",
    riskLevel: "High",
    lastVisit: "2025-06-12",
    nextAppointment: "2025-08-29",
    primaryProvider: "Dr. Davis",
  },
  {
    id: "P005",
    name: "Anderson, Lisa",
    dob: "05/14/1986",
    age: 38,
    condition: "Migraine",
    riskLevel: "Low",
    lastVisit: "2025-06-05",
    nextAppointment: "2025-09-05",
    primaryProvider: "Dr. Wilson",
  },
];

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
            {patientPoolData.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.id}</TableCell>
                <TableCell>
                  <div>
                    <div>
                      <span className="font-semibold">{patient.name.split(', ')[0]}</span>
                      {patient.name.includes(', ') && `, ${patient.name.split(', ')[1]}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      DOB: {patient.dob} • Age: {patient.age}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{patient.condition}</TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(patient.riskLevel)}>
                    {patient.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell>{patient.lastVisit}</TableCell>
                <TableCell>{patient.nextAppointment}</TableCell>
                <TableCell>{patient.primaryProvider}</TableCell>
              </TableRow>
            ))}
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