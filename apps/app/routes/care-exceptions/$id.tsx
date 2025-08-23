import { requireAuth } from "@/lib/auth-guard";
import { api } from "@/lib/trpc";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Clock, FileText, User } from "lucide-react";

export const Route = createFileRoute("/care-exceptions/$id")({
  beforeLoad: requireAuth,
  component: CareExceptionDetailPage,
});

// Lightweight humanized time using Intl.RelativeTimeFormat
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

function CareExceptionDetailPage() {
  const { id } = Route.useParams();

  // Fetch the specific care exception
  const {
    data: careException,
    isLoading,
    isError,
    error,
  } = api.careException.getById.useQuery(
    { id },
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
        <div className="text-muted-foreground">
          Loading care exception details...
        </div>
      </div>
    );
  }

  if (isError || !careException) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
        <div className="flex items-center gap-4">
          <Link to="/care-exceptions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Care Exceptions
            </Button>
          </Link>
        </div>
        <div className="text-red-600">
          Failed to load care exception details.{" "}
          {error?.message || "Care exception not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 2xl:p-8 3xl:p-12 4xl:p-16 w-full">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link to="/care-exceptions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Care Exceptions
          </Button>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">
            Care Exception Details
          </h1>
          <p className="text-muted-foreground">ID: {careException.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <div className="text-lg font-medium">
                {(() => {
                  const lastName = (careException.patientLastName ?? "").trim();
                  const firstName = (
                    careException.patientFirstName ?? ""
                  ).trim();
                  if (lastName || firstName) {
                    return `${firstName} ${lastName}`.trim();
                  }
                  return "Name not available";
                })()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Patient ID
              </label>
              <div className="font-mono">{careException.patientId}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                MRN
              </label>
              <div className="font-mono">
                {careException.patientMrnId || "Not available"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exception Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Exception Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <div className="text-lg">{careException.type}</div>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Severity
                </label>
                <div>
                  <Badge className={getSeverityColor(careException.severity)}>
                    {String(careException.severity).toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <Badge className={getStatusColor(careException.status)}>
                    {String(careException.status)
                      .replace("_", " ")
                      .toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                First Detected
              </label>
              <div>{humanizeTime(careException.firstDetectedAt)}</div>
              <div className="text-xs text-muted-foreground">
                {careException.firstDetectedAt
                  ? new Date(careException.firstDetectedAt).toLocaleString()
                  : "—"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Detected
              </label>
              <div>{humanizeTime(careException.lastDetectedAt)}</div>
              <div className="text-xs text-muted-foreground">
                {careException.lastDetectedAt
                  ? new Date(careException.lastDetectedAt).toLocaleString()
                  : "—"}
              </div>
            </div>
            {careException.resolvedAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Resolved
                </label>
                <div>{humanizeTime(careException.resolvedAt)}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(careException.resolvedAt).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escalation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {careException.escalated ? (
              <>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Escalated
                  </label>
                  <div>
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Yes
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Escalated At
                  </label>
                  <div>{humanizeTime(careException.escalatedAt)}</div>
                  <div className="text-xs text-muted-foreground">
                    {careException.escalatedAt
                      ? new Date(careException.escalatedAt).toLocaleString()
                      : "—"}
                  </div>
                </div>
                {careException.escalatedByType && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Escalated By
                    </label>
                    <div>{careException.escalatedByType}</div>
                  </div>
                )}
                {careException.escalatedByAgent && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Agent
                    </label>
                    <div>{careException.escalatedByAgent}</div>
                  </div>
                )}
                {careException.escalationReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Escalation Reason
                    </label>
                    <div className="text-sm">
                      {careException.escalationReason}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Escalated
                </label>
                <div>No</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section */}
      {careException.note && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap">
              {careException.note}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
