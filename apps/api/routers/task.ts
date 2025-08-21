/**
 * Task Management Router
 * 
 * Provides tRPC endpoints for task specification management,
 * including CRUD operations, version control, and querying.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, protectedProcedure } from "../lib/trpc.js";
import { TaskStorageService } from "../lib/task-storage.js";
import type {
  TaskSpecification,
  TaskCategory,
  TaskStatus,
  TaskPriority,
  TaskVersionStatus,
} from "../types/task-management.js";

const DEBUG_LOG = true;

if (DEBUG_LOG) console.log("TaskRouter: Initializing task management router");

// Input validation schemas
const taskQuerySchema = z.object({
  organizationId: z.string().optional(),
  teamId: z.string().optional(),
  category: z.enum(['Medication', 'Assessment', 'Education', 'Monitoring', 'Procedure', 'Documentation', 'Communication', 'Discharge', 'Follow-up', 'Other']).optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'deferred', 'failed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  versionStatus: z.enum(['draft', 'active', 'inactive']).optional(),
  isTemplate: z.boolean().optional(),
  isActive: z.boolean().optional(),
  searchTerm: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['name', 'category', 'priority', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const taskCreateSchema = z.object({
  taskId: z.string().min(1),
  name: z.string().min(1),
  category: z.enum(['Medication', 'Assessment', 'Education', 'Monitoring', 'Procedure', 'Documentation', 'Communication', 'Discharge', 'Follow-up', 'Other']),
  instructionPatient: z.string().min(1),
  instructionClinician: z.string().min(1),
  timing: z.object({
    offsetDays: z.number().optional(),
    durationDays: z.number().optional(),
    timeOfDay: z.string().optional(),
    isFlexible: z.boolean().optional(),
  }).optional(),
  conditions: z.object({
    medications: z.array(z.string()).optional(),
    surgery_types: z.array(z.string()).optional(),
    comorbidities: z.array(z.string()).optional(),
  }).optional(),
  evidence: z.object({
    source: z.string().optional(),
    url: z.string().url().optional(),
    level: z.string().optional(),
    publicationDate: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'deferred', 'failed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  versionStatus: z.enum(['draft', 'active', 'inactive']).default('draft'),
  version: z.string().default('1.0.0'),
  isTemplate: z.boolean().default(false),
});

const taskUpdateSchema = taskCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const taskRouter = router({
  // Get all tasks with filtering and pagination
  list: publicProcedure
    .input(taskQuerySchema)
    .query(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      return await taskStorage.queryTasks(input);
    }),

  // Get a single task by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      const task = await taskStorage.getTaskById(input.id);
      if (!task) {
        throw new Error("Task not found");
      }
      return task;
    }),

  // Create a new task
  create: publicProcedure
    .input(taskCreateSchema.extend({
      organizationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      const { organizationId, ...taskData } = input;
      
      // For now, use a placeholder user ID - this should come from auth context
      const userId = ctx.user?.id || "system";
      
      return await taskStorage.createTask(taskData, organizationId, userId);
    }),

  // Update an existing task
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      data: taskUpdateSchema,
    }))
    .mutation(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      
      // For now, use a placeholder user ID - this should come from auth context
      const userId = ctx.user?.id || "system";
      
      return await taskStorage.updateTask(input.id, input.data, userId);
    }),

  // Delete a task
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const taskStorage = new TaskStorageService(ctx.db);
      
      // For now, use a placeholder user ID - this should come from auth context
      const userId = ctx.user?.id || "system";
      
      await taskStorage.deleteTask(input.id, userId);
      return { success: true };
    }),
});

if (DEBUG_LOG) console.log("TaskRouter: Task management router initialized");