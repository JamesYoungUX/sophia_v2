/**
 * Task Management Router
 *
 * Provides tRPC endpoints for task specification management,
 * including CRUD operations, version control, and querying.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { TaskStorageService } from "../lib/task-storage.js";
import { publicProcedure, router } from "../lib/trpc.js";

const DEBUG_LOG = true;

if (DEBUG_LOG) console.log("TaskRouter: Initializing task management router");

// Simplified schemas to avoid Zod v4 issues
const taskUpdateSchema = z.object({
  id: z.string().min(1),
  taskId: z.string().optional(),
  name: z.string().optional(),
  category: z
    .enum(["Education", "Lifestyle/Health", "Logistics", "Medical"])
    .optional(),
  status: z
    .enum([
      "pending",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
      "deferred",
      "failed",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  versionStatus: z.enum(["draft", "active", "inactive"]).optional(),
  instructionPatient: z.string().optional(),
  instructionClinician: z.string().optional(),
  timingOffsetDays: z.number().optional(),
  timingDurationDays: z.number().optional(),
  timingTimeOfDay: z.string().optional(),
  timingIsFlexible: z.boolean().optional(),
  conditions: z.record(z.string(), z.unknown()).optional(),
  evidenceSource: z.string().optional(),
  evidenceUrl: z.string().optional(),
  evidenceLevel: z.string().optional(),
  evidencePublicationDate: z.string().optional(),
  evidenceNotes: z.string().optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  isValid: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const taskCreateSchema = z.object({
  taskId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(["Education", "Lifestyle/Health", "Logistics", "Medical"]),
  status: z
    .enum([
      "pending",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
      "deferred",
      "failed",
    ])
    .default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  versionStatus: z.enum(["draft", "active", "inactive"]).default("active"),
  instructionPatient: z.string().min(1),
  instructionClinician: z.string().min(1),
  timingOffsetDays: z.number().default(0),
  timingDurationDays: z.number().default(1),
  timingTimeOfDay: z.string().default("any"),
  timingIsFlexible: z.boolean().default(true),
  conditions: z.record(z.string(), z.unknown()).default({}),
  evidenceSource: z.string().optional(),
  evidenceUrl: z.string().optional(),
  evidenceLevel: z.string().default("Level 3"),
  evidencePublicationDate: z.string().optional(),
  evidenceNotes: z.string().optional(),
  isActive: z.boolean().default(true),
  isTemplate: z.boolean().default(true),
  isValid: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const taskQuerySchema = z.object({
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
  category: z
    .enum(["Education", "Lifestyle/Health", "Logistics", "Medical"])
    .optional(),
  status: z
    .enum([
      "pending",
      "scheduled",
      "in_progress",
      "completed",
      "cancelled",
      "deferred",
      "failed",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  versionStatus: z.enum(["draft", "active", "inactive"]).optional(),
  isTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
  searchTerm: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z
    .enum(["name", "category", "priority", "createdAt", "updatedAt"])
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const taskRouter = router({
  // Get all tasks with filtering and pagination
  list: publicProcedure.input(taskQuerySchema).query(async ({ input, ctx }) => {
    const taskStorage = new TaskStorageService(ctx.db);
    return await taskStorage.queryTasks(input);
  }),

  // Get a single task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      const task = await taskStorage.getTaskById(input.id);
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      return task;
    }),

  // Create a new task
  create: publicProcedure
    .input(taskCreateSchema)
    .mutation(async ({ input, ctx }) => {
      if (DEBUG_LOG) console.log("TaskRouter: Create task input:", input);

      const taskStorage = new TaskStorageService(ctx.db);

      // Get user ID from auth context
      const userId = ctx.user?.id || "system";

      // Get organization ID from session or use a default
      // TODO: Implement proper organization context
      const organizationId = "default-org-id"; // Temporary fallback

      return await taskStorage.createTask(input, organizationId, userId);
    }),

  // Update an existing task
  update: publicProcedure
    .input(taskUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      if (DEBUG_LOG) console.log("TaskRouter: Update task input:", input);

      const taskStorage = new TaskStorageService(ctx.db);

      const { id, ...updateData } = input;
      const userId = ctx.user?.id || "system";

      if (DEBUG_LOG) console.log("TaskRouter: Update data:", updateData);

      return await taskStorage.updateTask(id, updateData, userId);
    }),

  // Get care plans that use a specific task
  getPlansUsingTask: publicProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      return await taskStorage.getPlansUsingTask(input.taskId);
    }),

  // Delete a task
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);

      const userId = ctx.user?.id || "system";

      await taskStorage.deleteTask(input.id, userId);
      return { success: true };
    }),
});

if (DEBUG_LOG) console.log("TaskRouter: Task management router initialized");
