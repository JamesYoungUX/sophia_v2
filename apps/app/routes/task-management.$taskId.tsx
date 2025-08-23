import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Separator } from "@repo/ui/components/separator";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Tag,
  Users,
} from "lucide-react";
import { api } from "../lib/trpc";

const DEBUG_LOG = false;

// Helper function to safely format dates
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "- unavailable";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      if (DEBUG_LOG) console.warn("Invalid date encountered:", date);
      return "- unavailable";
    }
    return dateObj.toLocaleDateString();
  } catch (error) {
    if (DEBUG_LOG) console.error("Error formatting date:", error, date);
    return "- unavailable";
  }
};

// Helper function to safely display values
const safeDisplay = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "- unavailable";
  }
  return String(value);
};

// Note: StatusBadge component removed as status field is no longer displayed

// Priority badge component
function PriorityBadge({ priority }: { priority: string }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge className={`${getPriorityColor(priority)} border`}>{priority}</Badge>
  );
}

// Version status badge component
function VersionStatusBadge({ versionStatus }: { versionStatus: string }) {
  const getVersionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge className={`${getVersionStatusColor(versionStatus)} border`}>
      {versionStatus}
    </Badge>
  );
}

export const Route = createFileRoute("/task-management/$taskId")({
  component: TaskDetailsPage,
});

function TaskDetailsPage() {
  const { taskId } = Route.useParams();
  const navigate = useNavigate();

  if (DEBUG_LOG) console.log("TaskDetailsPage rendering with taskId:", taskId);

  // Use real API data instead of mock data
  const {
    data: task,
    isLoading,
    error,
  } = api.task.getById.useQuery({ id: taskId });

  if (DEBUG_LOG) {
    console.log("Task data:", task);
    console.log("Loading state:", isLoading);
    console.log("Error state:", error);
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading task details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message ||
              "The requested task could not be found or is unavailable."}
          </p>
          <Button onClick={() => navigate({ to: "/task-management" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  const handleBackToList = () => {
    navigate({ to: "/task-management" });
  };

  return (
    <>
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {safeDisplay(task.name)}
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main task details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Task Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Task ID
                  </Label>
                  <p className="font-mono text-sm mt-1">
                    {safeDisplay(task.taskId)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Category
                  </Label>
                  <p className="mt-1">{safeDisplay(task.category)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Priority
                  </Label>
                  <div className="mt-1">
                    {task.priority ? (
                      <PriorityBadge priority={task.priority} />
                    ) : (
                      <span>- unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Patient Instructions
                </Label>
                <p className="mt-2 text-sm leading-relaxed">
                  {safeDisplay(task.instructionPatient)}
                </p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Clinician Instructions
                </Label>
                <p className="mt-2 text-sm leading-relaxed">
                  {safeDisplay(task.instructionClinician)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timing & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Offset Days
                  </Label>
                  <p className="mt-1">
                    {task.timing?.offsetDays !== undefined
                      ? `${task.timing.offsetDays} days`
                      : "- unavailable"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Duration
                  </Label>
                  <p className="mt-1">
                    {task.timing?.durationDays !== undefined
                      ? `${task.timing.durationDays} day(s)`
                      : "- unavailable"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Time of Day
                  </Label>
                  <p className="mt-1">
                    {task.timing?.timeOfDay || "- unavailable"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Flexibility
                  </Label>
                  <p className="mt-1">
                    {task.timing?.isFlexible !== undefined
                      ? task.timing.isFlexible
                        ? "Flexible"
                        : "Strict"
                      : "- unavailable"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Version Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Version Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Version
                </Label>
                <p className="mt-1 font-mono">{safeDisplay(task.version)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status
                </Label>
                <div className="mt-1">
                  {task.versionStatus ? (
                    <VersionStatusBadge versionStatus={task.versionStatus} />
                  ) : (
                    <span>- unavailable</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Surgery Types
                </Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.conditions?.surgery_types &&
                  task.conditions.surgery_types.length > 0 ? (
                    task.conditions.surgery_types.map(
                      (type: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {type}
                        </Badge>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      - unavailable
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Medications
                </Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.conditions?.medications &&
                  task.conditions.medications.length > 0 ? (
                    task.conditions.medications.map(
                      (med: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {med}
                        </Badge>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      - unavailable
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Comorbidities
                </Label>
                <div className="mt-2 flex flex-wrap gap-1">
                  {task.conditions?.comorbidities &&
                  task.conditions.comorbidities.length > 0 ? (
                    task.conditions.comorbidities.map(
                      (condition: string, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {condition}
                        </Badge>
                      ),
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      - unavailable
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Source
                </Label>
                <p className="mt-1 text-sm">
                  {safeDisplay(task.evidence?.source)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Evidence Level
                </Label>
                <p className="mt-1 text-sm">
                  {safeDisplay(task.evidence?.level)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Publication Date
                </Label>
                <p className="mt-1 text-sm">
                  {formatDate(task.evidence?.publicationDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Notes
                </Label>
                <p className="mt-1 text-sm leading-relaxed">
                  {safeDisplay(task.evidence?.notes)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Created
                </Label>
                <p className="mt-1 text-sm">{formatDate(task.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </Label>
                <p className="mt-1 text-sm">{formatDate(task.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
