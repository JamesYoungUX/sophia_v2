import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState } from "react";
import { api } from "../../lib/trpc";

function TaskInstructionsPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/task-management/create-step2" });
  const utils = api.useUtils();

  // Parse the step1Data from the search params
  const step1Data = search.step1Data ? JSON.parse(search.step1Data) : null;
  const isEditing = !!search.taskId;

  const [instructions, setInstructions] = useState({
    patientInstructions: step1Data?.instructionPatient || "",
    clinicianInstructions: step1Data?.instructionClinician || "",
  });

  const createTaskMutation = api.task.create.useMutation({
    onSuccess: async () => {
      // Invalidate task list to show new task
      await utils.task.list.invalidate();
      navigate({ to: "/task-management" });
    },
    onError: (error) => {
      console.error("Failed to create task:", error);
    },
  });

  const updateTaskMutation = api.task.update.useMutation({
    onSuccess: async (data) => {
      // Invalidate queries to refresh cached data
      await utils.task.getById.invalidate({ id: search.taskId });
      await utils.task.list.invalidate();

      navigate({ to: "/task-management" });
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine step 1 and step 2 data
    const completeTaskData = {
      ...step1Data,
      instructionPatient: instructions.patientInstructions,
      instructionClinician: instructions.clinicianInstructions,
    };

    // Clean up empty string values that should be undefined for the schema
    const cleanData = Object.fromEntries(
      Object.entries(completeTaskData).filter(([key, value]) => {
        // Keep non-string values and non-empty strings
        return typeof value !== "string" || value !== "";
      }),
    );

    if (isEditing) {
      // Update existing task
      const updateData = {
        id: search.taskId,
        ...cleanData,
      };
      updateTaskMutation.mutate(updateData);
    } else {
      // Create new task
      createTaskMutation.mutate(cleanData);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Task" : "Create Task"} - Step 2: Instructions
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update" : "Add"} patient and clinician instructions
            for: {step1Data?.name || "Unknown Task"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() =>
            navigate({
              to: "/task-management/create",
              search: { taskId: search.taskId },
            })
          }
        >
          Back to Step 1
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Instructions</CardTitle>
            <CardDescription>
              Instructions that will be shown to patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="patientInstructions">Patient Instructions</Label>
              <Textarea
                id="patientInstructions"
                value={instructions.patientInstructions}
                onChange={(e) =>
                  setInstructions((prev) => ({
                    ...prev,
                    patientInstructions: e.target.value,
                  }))
                }
                placeholder="Enter instructions for patients..."
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clinician Instructions</CardTitle>
            <CardDescription>
              Instructions that will be shown to healthcare providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clinicianInstructions">
                Clinician Instructions
              </Label>
              <Textarea
                id="clinicianInstructions"
                value={instructions.clinicianInstructions}
                onChange={(e) =>
                  setInstructions((prev) => ({
                    ...prev,
                    clinicianInstructions: e.target.value,
                  }))
                }
                placeholder="Enter instructions for clinicians..."
                rows={6}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              navigate({
                to: "/task-management/create",
                search: { taskId: search.taskId },
              })
            }
          >
            Back
          </Button>
          <Button
            type="submit"
            disabled={
              createTaskMutation.isPending || updateTaskMutation.isPending
            }
          >
            {createTaskMutation.isPending || updateTaskMutation.isPending
              ? "Saving..."
              : isEditing
                ? "Update Task"
                : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Route with NO validation at all
export const Route = createFileRoute("/task-management/create-step2")({
  component: TaskInstructionsPage,
});
