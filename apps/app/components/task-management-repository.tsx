import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@repo/ui/components/collapsible";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/trpc";

const DEBUG_LOG = false;

// Helper function to safely format dates
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) {
    return "- unavailable";
  }

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "- unavailable";
    }
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "- unavailable";
  }
};

// Helper function to safely display data with fallback
const safeDisplay = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return "- unavailable";
  }
  return String(value);
};

// Types based on our task management system
interface TaskSpecification {
  id: string;
  taskId: string;
  name: string;
  category:
    | "Medication"
    | "Assessment"
    | "Education"
    | "Monitoring"
    | "Procedure"
    | "Documentation"
    | "Communication"
    | "Discharge"
    | "Follow-up"
    | "Other";
  instructionPatient: string;
  instructionClinician: string;
  timing?: {
    offsetDays?: number;
    durationDays?: number;
    timeOfDay?: string;
    isFlexible?: boolean;
  };
  conditions?: {
    medications?: string[];
    surgery_types?: string[];
    comorbidities?: string[];
  };
  evidence?: {
    source?: string;
    url?: string;
    level?: string;
    publicationDate?: string;
    notes?: string;
  };
  status:
    | "pending"
    | "scheduled"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "deferred"
    | "failed";
  priority: "low" | "medium" | "high" | "critical";
  versionStatus: "draft" | "active" | "inactive";
  version: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SearchFilters {
  query: string;
  category?: string;
  priority?: string;
  versionStatus?: string;
  isTemplate?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

// Note: Mock data removed - now using real API data only

// Version status badge component
function VersionStatusBadge({
  versionStatus,
}: {
  versionStatus: TaskSpecification["versionStatus"];
}) {
  const statusConfig = {
    draft: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    active: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    inactive: { color: "bg-gray-100 text-gray-800", icon: AlertCircle },
  };

  const config = statusConfig[versionStatus];
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {versionStatus}
    </Badge>
  );
}

// Search and filter component
interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  navigate: ReturnType<typeof useNavigate>;
}

function SearchFilters({
  filters,
  onFiltersChange,
  navigate,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    if (DEBUG_LOG) console.log("Filter change:", key, value);
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter Tasks</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? "Hide Filters" : "Show Filters"}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 ml-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
            <Button
              onClick={() => navigate({ to: "/task-management/create" })}
              className="ml-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks by name, ID, or instructions..."
            value={filters.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
            className="flex-1"
          />
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="priority-filter">Priority</Label>
                <Select
                  value={filters.priority || ""}
                  onValueChange={(value) =>
                    handleFilterChange("priority", value || undefined)
                  }
                >
                  <SelectTrigger id="priority-filter">
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="template-filter">Type</Label>
                <Select
                  value={
                    filters.isTemplate === undefined
                      ? ""
                      : filters.isTemplate
                        ? "true"
                        : "false"
                  }
                  onValueChange={(value) =>
                    handleFilterChange(
                      "isTemplate",
                      value === "" ? undefined : value === "true",
                    )
                  }
                >
                  <SelectTrigger id="template-filter">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="true">Templates</SelectItem>
                    <SelectItem value="false">Instances</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// Task list component
interface TaskListProps {
  tasks: TaskSpecification[];
  onTaskSelect: (task: TaskSpecification) => void;
  onEditTask: (taskId: string) => void;
}

function TaskList({ tasks, onTaskSelect, onEditTask }: TaskListProps) {
  if (DEBUG_LOG) console.log("Rendering task list with", tasks.length, "tasks");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Specifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Version Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Updated</TableHead>

              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onTaskSelect(task)}
              >
                <TableCell className="font-mono text-sm">
                  {safeDisplay(task.taskId)}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{safeDisplay(task.name)}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {safeDisplay(task.instructionPatient)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{safeDisplay(task.category)}</TableCell>
                <TableCell>{safeDisplay(task.priority)}</TableCell>
                <TableCell>
                  <VersionStatusBadge versionStatus={task.versionStatus} />
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {safeDisplay(task.version)}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {formatDate(task.updatedAt)}
                </TableCell>

                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task.id);
                    }}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No tasks found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main component
export function TaskManagementRepository() {
  // All hooks must be called at the top level, before any conditional logic
  const navigate = useNavigate();
  const {
    data: tasks,
    isLoading,
    error,
    refetch,
  } = api.task.list.useQuery(
    {},
    {
      retry: false,
      refetchOnWindowFocus: true,
    },
  );
  const [filters, setFilters] = useState<SearchFilters>({ query: "" });

  // Refetch data when component mounts to ensure we have the latest data
  useEffect(() => {
    refetch();
  }, [refetch]);

  if (DEBUG_LOG) {
    console.log("TaskManagementRepository: API Response - tasks:", tasks);
    console.log(
      "TaskManagementRepository: API Response - isLoading:",
      isLoading,
    );
    console.log("TaskManagementRepository: API Response - error:", error);
  }

  // Filter tasks based on search criteria
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return [];
    }

    return tasks.filter((task: any) => {
      if (
        filters.query &&
        !(
          task.name?.toLowerCase().includes(filters.query.toLowerCase()) ||
          task.taskId?.toLowerCase().includes(filters.query.toLowerCase()) ||
          task.instructionPatient
            ?.toLowerCase()
            .includes(filters.query.toLowerCase()) ||
          task.instructionClinician
            ?.toLowerCase()
            .includes(filters.query.toLowerCase())
        )
      ) {
        return false;
      }

      if (filters.category && task.category !== filters.category) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.versionStatus && task.versionStatus !== filters.versionStatus)
        return false;
      if (
        filters.isTemplate !== undefined &&
        task.isTemplate !== filters.isTemplate
      )
        return false;

      return true;
    });
  }, [tasks, filters]);

  const handleTaskSelect = useCallback(
    (task: any) => {
      if (DEBUG_LOG) console.log("Navigating to task details:", task.taskId);
      navigate({ to: "/task-management/create", search: { taskId: task.id } });
    },
    [navigate],
  );

  // Debug logging after all hooks are called
  if (DEBUG_LOG) {
    console.log("TaskManagementRepository: tasks data:", tasks);
    console.log("TaskManagementRepository: isLoading:", isLoading);
    console.log("TaskManagementRepository: error:", error);
    console.log(
      "Rendering TaskManagementRepository with",
      filteredTasks.length,
      "filtered tasks",
    );
  }

  // Early returns for loading and error states come after all hooks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error || (!isLoading && !tasks)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">
            {error
              ? `Error loading tasks: ${error.message}`
              : "Unable to connect to database - data unavailable"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">
            Manage and organize task specifications for care plans
          </p>
        </div>
      </div>

      <SearchFilters
        filters={filters}
        onFiltersChange={setFilters}
        navigate={navigate}
      />

      <TaskList
        tasks={filteredTasks as any[]}
        onTaskSelect={handleTaskSelect}
        onEditTask={(taskId) =>
          navigate({ to: "/task-management/create", search: { taskId } })
        }
      />
    </>
  );
}

export default TaskManagementRepository;
