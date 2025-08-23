import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Textarea } from "@repo/ui/components/textarea";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "../../lib/trpc";

interface TaskFormData {
  taskId: string;
  name: string;
  category: string;
  status: string;
  priority: string;
  versionStatus: string;
  instructionPatient: string;
  instructionClinician: string;
  timingOffsetDays: number;
  timingDurationDays: number;
  timingTimeOfDay: string;
  timingIsFlexible: boolean;
  conditions: Record<string, any>;
  evidenceSource: string;
  evidenceUrl: string;
  evidenceLevel: string;
  evidencePublicationDate: string;
  evidenceNotes: string;
  isActive: boolean;
  isTemplate: boolean;
  isValid: boolean;
  metadata: {
    description?: string;
    estimatedDuration?: string;
    dependencies?: string[];
    completionCriteria?: string;
    tags?: string[];
  };
}

const CATEGORIES = ["Education", "Lifestyle/Health", "Logistics", "Medical"];

const STATUSES = [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "deferred",
  "failed",
];

const PRIORITIES = ["low", "medium", "high", "critical"];

const VERSION_STATUSES = ["draft", "active", "inactive"];

const EVIDENCE_LEVELS = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];

const TIME_OF_DAY_OPTIONS = ["any", "morning", "afternoon", "evening", "night"];

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/task-management/create" });
  const taskId = search.taskId; // For editing existing tasks

  const [formData, setFormData] = useState<TaskFormData>({
    taskId: "",
    name: "",
    category: "Education",
    status: "pending",
    priority: "medium",
    versionStatus: "active",
    instructionPatient: "",
    instructionClinician: "",
    timingOffsetDays: 0,
    timingDurationDays: 1,
    timingTimeOfDay: "any",
    timingIsFlexible: true,
    conditions: {},
    evidenceSource: "",
    evidenceUrl: "",
    evidenceLevel: "Level 3",
    evidencePublicationDate: "",
    evidenceNotes: "",
    isActive: true,
    isTemplate: true,
    isValid: false,
    metadata: {
      description: "",
      estimatedDuration: "",
      dependencies: [],
      completionCriteria: "",
      tags: [],
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch existing task if editing
  const { data: existingTask, isLoading: isLoadingTask } =
    api.task.getById.useQuery(
      { id: taskId! },
      {
        enabled: !!taskId && taskId.length > 0,
        retry: false,
        refetchOnWindowFocus: false,
      },
    );

  const createTaskMutation = api.task.create.useMutation({
    onSuccess: () => {
      navigate({ to: "/task-management" });
    },
  });

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: () => {
      navigate({ to: "/task-management" });
    },
  });

  useEffect(() => {
    if (existingTask && taskId) {
      setIsEditing(true);

      // Ensure versionStatus has a valid value from the enum
      const validVersionStatus =
        existingTask.versionStatus &&
        VERSION_STATUSES.includes(existingTask.versionStatus)
          ? existingTask.versionStatus
          : "active";

      // Ensure priority has a valid value from the enum
      const validPriority =
        existingTask.priority && PRIORITIES.includes(existingTask.priority)
          ? existingTask.priority
          : "medium";

      // Ensure category has a valid value from the enum
      const validCategory =
        existingTask.category && CATEGORIES.includes(existingTask.category)
          ? existingTask.category
          : "Education";

      setFormData({
        taskId: existingTask.taskId || "",
        name: existingTask.name || "",
        category: validCategory,
        status: existingTask.status || "pending",
        priority: validPriority,
        versionStatus: validVersionStatus,
        instructionPatient: existingTask.instructionPatient || "",
        instructionClinician: existingTask.instructionClinician || "",
        timingOffsetDays: existingTask.timingOffsetDays || 0,
        timingDurationDays: existingTask.timingDurationDays || 1,
        timingTimeOfDay: existingTask.timingTimeOfDay || "any",
        timingIsFlexible: existingTask.timingIsFlexible ?? true,
        conditions: existingTask.conditions || {},
        evidenceSource: existingTask.evidenceSource || "",
        evidenceUrl: existingTask.evidenceUrl || "",
        evidenceLevel: existingTask.evidenceLevel || "Level 3",
        evidencePublicationDate: existingTask.evidencePublicationDate || "",
        evidenceNotes: existingTask.evidenceNotes || "",
        isActive: existingTask.isActive ?? true,
        isTemplate: existingTask.isTemplate ?? true,
        isValid: existingTask.isValid ?? false,
        metadata: existingTask.metadata || {
          description: "",
          estimatedDuration: "",
          dependencies: [],
          completionCriteria: "",
          tags: [],
        },
      });
    }
  }, [existingTask, taskId]);

  const handleInputChange = (field: string, value: any) => {
    // Prevent Select component from overriding with empty values during initialization
    if (field === "versionStatus" && (!value || value === "")) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields before proceeding
    if (!formData.taskId.trim()) {
      alert("Task ID is required");
      return;
    }

    if (!formData.name.trim()) {
      alert("Task name is required");
      return;
    }

    // Always navigate to step 2 (instructions) for both creating and editing
    const searchParams = {
      step1Data: JSON.stringify(formData),
      ...(isEditing && taskId && { taskId }),
    };

    try {
      navigate({
        to: "/task-management/create-step2",
        search: searchParams,
      });
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Error navigating to next step. Please try again.");
    }
  };

  const generateTaskId = () => {
    const timestamp = Date.now().toString().slice(-5);
    const randomSuffix = crypto.randomUUID().slice(0, 2);
    const categoryPrefix = formData.category.toLowerCase().slice(0, 3);
    return `T-${categoryPrefix}-${timestamp}${randomSuffix}`;
  };

  if (isLoadingTask) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading task...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing
              ? `Edit Task: ${existingTask?.name || "Loading..."}`
              : "Create New Task - Step 1"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update task details and settings"
              : "Create a new task specification"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/task-management" })}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Core task details and identification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskId">Task ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="taskId"
                    value={formData.taskId}
                    onChange={(e) =>
                      handleInputChange("taskId", e.target.value)
                    }
                    placeholder="e.g., T-edu-12345"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      handleInputChange("taskId", generateTaskId())
                    }
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter task name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority || ""}
                  onValueChange={(value) =>
                    handleInputChange("priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.metadata.description || ""}
                onChange={(e) =>
                  handleMetadataChange("description", e.target.value)
                }
                placeholder="Describe what this task involves..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>
              Tags, dependencies, and completion criteria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                <Input
                  id="estimatedDuration"
                  value={formData.metadata.estimatedDuration || ""}
                  onChange={(e) =>
                    handleMetadataChange("estimatedDuration", e.target.value)
                  }
                  placeholder="e.g., 30 minutes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionCriteria">Completion Criteria</Label>
                <Input
                  id="completionCriteria"
                  value={formData.metadata.completionCriteria || ""}
                  onChange={(e) =>
                    handleMetadataChange("completionCriteria", e.target.value)
                  }
                  placeholder="e.g., Patient demonstrates understanding"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.metadata.tags?.join(", ") || ""}
                onChange={(e) =>
                  handleMetadataChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t),
                  )
                }
                placeholder="pre-op, education, safety"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependencies">
                Dependencies (comma-separated)
              </Label>
              <Input
                id="dependencies"
                value={formData.metadata.dependencies?.join(", ") || ""}
                onChange={(e) =>
                  handleMetadataChange(
                    "dependencies",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t),
                  )
                }
                placeholder="T-assess-12345, T-med-67890"
              />
            </div>
          </CardContent>
        </Card>

        {/* Care Plans Using This Task - Only show when editing */}
        {isEditing && taskId && (
          <Card>
            <CardHeader>
              <CardTitle>Care Plans Using This Task</CardTitle>
              <CardDescription>
                Care plans that will be affected by changes to this task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-gray-500">
                <p>No care plans currently using this task.</p>
                <p className="text-sm mt-2">
                  When care plans are created that reference this task, they
                  will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Task Settings</CardTitle>
            <CardDescription>Configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="versionStatus">Version Status</Label>
                <Select
                  value={formData.versionStatus}
                  onValueChange={(value) =>
                    handleInputChange("versionStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select version status" />
                  </SelectTrigger>
                  <SelectContent>
                    {VERSION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTemplate"
                  checked={formData.isTemplate}
                  onChange={(e) =>
                    handleInputChange("isTemplate", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isTemplate">Template</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isValid"
                  checked={formData.isValid}
                  onChange={(e) =>
                    handleInputChange("isValid", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isValid">Validated</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/task-management" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Next: Instructions"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export const Route = createFileRoute("/task-management/create")({
  component: TaskCreatePage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      taskId: (search.taskId as string) || undefined,
    };
  },
});
