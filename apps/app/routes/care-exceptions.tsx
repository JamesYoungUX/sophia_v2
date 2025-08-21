import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";
import { api } from "@/lib/trpc";
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { Badge } from "@repo/ui";
import { Toggle } from "@repo/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui";
import { AlertTriangle, Clock, User } from "lucide-react";

export const Route = createFileRoute("/care-exceptions")({
  beforeLoad: requireAuth,
  component: InterventionsPage,
});

// Debug logging flag for this module; disable when feature is verified
const DEBUG_LOG = false;

// Lightweight humanized time using Intl.RelativeTimeFormat to avoid extra deps
function humanizeTime(input?: string | Date | null): string {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (!(date instanceof Date) || isNaN(date.getTime())) return "—";
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    const value = Math.round(absMs / ms);
    if (value >= 1) {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
      // For past dates: diffMs < 0, so we want negative value for rtf.format
      // For future dates: diffMs > 0, so we want positive value for rtf.format
      return rtf.format(diffMs < 0 ? -value : value, unit);
    }
  }
  return "just now";
}

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
  // API uses: open, acknowledged, in_progress, resolved, dismissed
  switch (status) {
    case "open":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "acknowledged":
      return "bg-violet-100 text-violet-800 border-violet-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "resolved":
      return "bg-green-100 text-green-800 border-green-200";
    case "dismissed":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

function InterventionsPage() {
  const { data: session } = auth.useSession();

  // Local UI state: filter toggle for Escalated-only
  const [escalatedOnly, setEscalatedOnly] = React.useState<boolean>(false);

  // Fetch live care exceptions via tRPC with optional escalatedOnly filter
  const { data, isLoading, isError, error, isFetching } = api.careException.list.useQuery(
    { escalatedOnly },
    {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  );

  // Log success data and verify humanized timestamps on small sample when data changes
  React.useEffect(() => {
    if (!DEBUG_LOG) return;
    const count = (data as any[])?.length ?? 0;
    console.log("[CareExceptions] query success", { escalatedOnly, count });
    if (Array.isArray(data) && data.length > 0) {
      const sample = (data as any[]).slice(0, 3).map((r: any) => ({
        id: r.id,
        firstDetectedAt: r.firstDetectedAt ?? null,
        firstDetectedAt_h: humanizeTime(r.firstDetectedAt ?? null),
        lastDetectedAt: r.lastDetectedAt ?? null,
        lastDetectedAt_h: humanizeTime(r.lastDetectedAt ?? null),
      }));
      console.debug("[CareExceptions] timestamp sample (first 3)", sample);
      // Log the first item's patient fields specifically
      if (data[0]) {
        const item = data[0];
        console.log("[CareExceptions] first item patient fields:", {
          patientId: item.patientId,
          patientFirstName: item.patientFirstName,
          patientLastName: item.patientLastName,
          patientMrnId: item.patientMrnId,
          allKeys: Object.keys(item)
        });
      }
    }
  }, [data, escalatedOnly]);

  // Log query error state changes
  React.useEffect(() => {
    if (!DEBUG_LOG || !isError) return;
    console.error("[CareExceptions] query error", { escalatedOnly, err: error });
  }, [isError, error, escalatedOnly]);

  const rows = data ?? [];
  if (DEBUG_LOG)
    console.log("[CareExceptions] render", {
      session: Boolean(session),
      escalatedOnly,
      isLoading,
      isFetching,
      count: rows.length,
    });

  // Derive dashboard stats conservatively from available fields
  const now = Date.now();
  const stats = {
    totalCases: rows.length,
    highPriority: rows.filter((c: any) => c.severity === "high").length,
    overdue: rows.filter(
      (c: any) => c.firstDetectedAt && now - new Date(c.firstDetectedAt as any).getTime() > 3 * 24 * 60 * 60 * 1000
    ).length,
    inProgress: rows.filter((c: any) => c.status === "in_progress").length,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Care Exceptions</h1>
        <p className="text-muted-foreground">Address exceptional cases in patient surgical care with compassion</p>
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
            <p className="text-xs text-muted-foreground">Active intervention cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">Past due date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being addressed</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Active Care Exceptions</CardTitle>
              <CardDescription>Live feed of care exceptions from the platform</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Escalated only</span>
              <Toggle
                aria-label="Toggle escalated only filter"
                pressed={escalatedOnly}
                onPressedChange={(v) => {
                  if (DEBUG_LOG) console.log("[CareExceptions] toggle escalatedOnly", v);
                  setEscalatedOnly(Boolean(v));
                }}
                variant="default"
                size="sm"
              >
                Escalated
              </Toggle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError && (
            <div className="text-sm text-red-600 mb-3">
              Failed to load care exceptions. {DEBUG_LOG ? String(error) : null}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First Detected</TableHead>
                <TableHead>Last Detected</TableHead>
                <TableHead>Escalation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="text-sm text-muted-foreground">Loading care exceptions...</div>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="text-sm text-muted-foreground">No care exceptions found.</div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        {/* Top line: Lastname, First name; fallback to patientId if both names missing */}
                        <span className="font-medium">
                          {(() => {
                            const lastName = (item.patientLastName ?? "").trim();
                            const firstName = (item.patientFirstName ?? "").trim();
                            if (lastName || firstName) {
                              return `${lastName}${lastName && firstName ? ", " : ""}${firstName}`;
                            }
                            return item.patientId;
                          })()}
                        </span>
                        {/* Second line: PID and MRN with fallback */}
                        <span className="text-xs text-muted-foreground">
                          PID: {item.patientId} • MRN: {item.patientMrnId ?? "abc"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm">{item.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(item.severity)}>
                        {String(item.severity).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {String(item.status).replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{humanizeTime(item.firstDetectedAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(
                            (item.firstDetectedAt as any) ?? (item.createdAt as any) ?? (item.updatedAt as any) ?? Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{humanizeTime(item.lastDetectedAt)}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.lastDetectedAt ? new Date(item.lastDetectedAt as any).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.escalated ? (
                        <div className="flex flex-col gap-1">
                          <Badge className="bg-red-100 text-red-800 border-red-200">Escalated</Badge>
                          <span className="text-xs text-muted-foreground">{humanizeTime(item.escalatedAt)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* End Cases Table */}
    </div>
  );
}