/**
 * Task Storage Service
 * 
 * Provides CRUD operations and querying capabilities for task specifications
 * with version control and audit trails.
 */

import { eq, and, or, desc, asc, like, inArray } from "drizzle-orm";
import type { DbSchema } from "@repo/db";
import { schema } from "@repo/db";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type {
  TaskSpecification,
  TaskValidationResult,
  TaskImportResult,
  TaskBatchImportResult,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TaskVersionStatus,
  DependencyType,
} from "../types/task-management";

type AuditAction = 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'validated' | 'assigned' | 'executed' | 'completed' | 'failed';

const DEBUG_LOG = false;

if (DEBUG_LOG) console.log("TaskStorageService: Initializing task storage service");

export interface TaskQueryOptions {
  organizationId?: string;
  teamId?: string;
  category?: TaskCategory;
  status?: TaskStatus;
  priority?: TaskPriority;
  versionStatus?: TaskVersionStatus;
  isTemplate?: boolean;
  isActive?: boolean;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'category' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskCreateData {
  taskId: string;
  name: string;
  category: TaskCategory;
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
  status?: TaskStatus;
  priority?: TaskPriority;
  versionStatus?: TaskVersionStatus;
  version?: string;
  isTemplate?: boolean;
  teamId?: string;
  metadata?: Record<string, unknown>;
}

export class TaskStorageService {
  constructor(private db: PostgresJsDatabase<DbSchema>) {
    if (DEBUG_LOG) console.log("TaskStorageService: Service initialized");
  }

  /**
   * Create a new task specification
   */
  async createTask(
    taskData: TaskCreateData,
    organizationId: string,
    userId: string
  ): Promise<TaskSpecification> {
    if (DEBUG_LOG) console.log("TaskStorageService: Creating task", { taskId: taskData.taskId, name: taskData.name });

    const taskId = crypto.randomUUID();
    const now = new Date();

    try {
      // Insert main task specification
      const [insertedTask] = await this.db
        .insert(schema.taskSpecification)
        .values({
          id: taskId,
          taskId: taskData.taskId,
          name: taskData.name,
          category: taskData.category,
          instructionPatient: taskData.instructionPatient,
          instructionClinician: taskData.instructionClinician,
          timingOffsetDays: taskData.timing?.offsetDays || 0,
          timingDurationDays: taskData.timing?.durationDays || 1,
          timingTimeOfDay: taskData.timing?.timeOfDay,
          timingIsFlexible: taskData.timing?.isFlexible || false,
          conditions: {
            medications: taskData.conditions?.medications || [],
            surgery_types: taskData.conditions?.surgery_types || [],
            comorbidities: taskData.conditions?.comorbidities || [],
          },
          evidenceSource: taskData.evidence?.source || '',
          evidenceUrl: taskData.evidence?.url || '',
          evidenceLevel: taskData.evidence?.level,
          evidencePublicationDate: taskData.evidence?.publicationDate,
          evidenceNotes: taskData.evidence?.notes,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          versionStatus: taskData.versionStatus || 'draft',
          version: taskData.version || '1.0.0',
          isTemplate: taskData.isTemplate || false,
          organizationId,
          teamId: taskData.teamId,
          metadata: taskData.metadata,
          createdBy: userId,
          updatedBy: userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      // Create version record
      await this.db.insert(schema.taskVersion).values({
        taskSpecificationId: insertedTask.id,
        version: insertedTask.version,
        taskData: taskData as any,
        changeDescription: "Initial version",
        isActive: true,
        createdBy: userId,
      });

      // Create audit log
      await this.createAuditLog({
        entityType: 'task_specification',
        entityId: insertedTask.id,
        action: 'created',
        description: `Task '${taskData.name}' created`,
        newValues: insertedTask,
        userId,
      });

      if (DEBUG_LOG) console.log("TaskStorageService: Task created successfully", { id: insertedTask.id });
      
      return this.mapDbTaskToInterface(insertedTask);
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error creating task", error);
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing task specification
   */
  async updateTask(
    taskId: string,
    updates: Partial<TaskCreateData>,
    userId: string
  ): Promise<TaskSpecification> {
    if (DEBUG_LOG) console.log("TaskStorageService: Updating task", { taskId, updates });

    const now = new Date();

    const updateData = {
      ...(updates.name && { name: updates.name }),
      ...(updates.category && { category: updates.category }),
      ...(updates.instructionPatient && { instructionPatient: updates.instructionPatient }),
      ...(updates.instructionClinician && { instructionClinician: updates.instructionClinician }),
      ...(updates.timing?.offsetDays !== undefined && { timingOffsetDays: updates.timing.offsetDays }),
      ...(updates.timing?.durationDays !== undefined && { timingDurationDays: updates.timing.durationDays }),
      ...(updates.conditions && { conditions: {
        medications: updates.conditions.medications || [],
        surgery_types: updates.conditions.surgery_types || [],
        comorbidities: updates.conditions.comorbidities || [],
      } }),
      ...(updates.evidence?.source && { evidenceSource: updates.evidence.source }),
      ...(updates.evidence?.url && { evidenceUrl: updates.evidence.url }),
      ...(updates.status && { status: updates.status }),
      ...(updates.priority && { priority: updates.priority }),
      ...(updates.isTemplate !== undefined && { isTemplate: updates.isTemplate }),
      updatedBy: userId,
      updatedAt: now,
    };

    try {
      const result = await this.db
        .update(schema.taskSpecification)
        .set(updateData)
        .where(eq(schema.taskSpecification.id, taskId))
        .returning();

      if (result.length === 0) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updatedTask = result[0];

      // Create audit log
      await this.createAuditLog({
        entityType: 'task_specification',
        entityId: taskId,
        action: 'updated',
        description: `Task '${updatedTask.name}' updated`,
        newValues: updateData,
        userId,
      });

      if (DEBUG_LOG) console.log("TaskStorageService: Task updated successfully", { id: taskId });
      
      return this.mapDbTaskToInterface(updatedTask);
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error updating task", error);
      throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a task by ID
   */
  async getTaskById(taskId: string): Promise<TaskSpecification | null> {
    if (DEBUG_LOG) console.log("TaskStorageService: Getting task by ID", { taskId });

    try {
      const result = await this.db
        .select()
        .from(schema.taskSpecification)
        .where(eq(schema.taskSpecification.id, taskId))
        .limit(1);

      if (result.length === 0) {
        if (DEBUG_LOG) console.log("TaskStorageService: Task not found", { taskId });
        return null;
      }

      return this.mapDbTaskToInterface(result[0]);
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error getting task", error);
      throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Query tasks with filtering and pagination
   */
  async queryTasks(options: TaskQueryOptions = {}): Promise<TaskSpecification[]> {
    if (DEBUG_LOG) console.log("TaskStorageService: Querying tasks", options);

    try {
      let query = this.db.select().from(schema.taskSpecification);

      // Build where conditions
      const conditions = [];
      
      if (options.organizationId) {
        conditions.push(eq(schema.taskSpecification.organizationId, options.organizationId));
      }
      
      if (options.teamId) {
        conditions.push(eq(schema.taskSpecification.teamId, options.teamId));
      }
      
      if (options.category) {
        conditions.push(eq(schema.taskSpecification.category, options.category));
      }
      
      if (options.status) {
        conditions.push(eq(schema.taskSpecification.status, options.status));
      }
      
      if (options.priority) {
        conditions.push(eq(schema.taskSpecification.priority, options.priority));
      }
      
      if (options.isTemplate !== undefined) {
        conditions.push(eq(schema.taskSpecification.isTemplate, options.isTemplate));
      }
      
      if (options.isActive !== undefined) {
        conditions.push(eq(schema.taskSpecification.isActive, options.isActive));
      }
      
      if (options.versionStatus) {
        conditions.push(eq(schema.taskSpecification.versionStatus, options.versionStatus));
      }
      
      if (options.searchTerm) {
        conditions.push(
          or(
            like(schema.taskSpecification.name, `%${options.searchTerm}%`),
            like(schema.taskSpecification.instructionPatient, `%${options.searchTerm}%`),
            like(schema.taskSpecification.instructionClinician, `%${options.searchTerm}%`)
          )
        );
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      // Add sorting
      const sortColumn = options.sortBy || 'createdAt';
      const sortDirection = options.sortOrder || 'desc';
      
      if (sortDirection === 'asc') {
        query = query.orderBy(asc(schema.taskSpecification[sortColumn])) as any;
      } else {
        query = query.orderBy(desc(schema.taskSpecification[sortColumn])) as any;
      }

      // Add pagination
      if (options.limit) {
        query = query.limit(options.limit) as any;
      }
      
      if (options.offset) {
        query = query.offset(options.offset) as any;
      }

      const results = await query;
      
      if (DEBUG_LOG) console.log("TaskStorageService: Query completed", { count: results.length });
      
      return results.map(task => this.mapDbTaskToInterface(task));
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error querying tasks", error);
      throw new Error(`Failed to query tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a task (soft delete by setting isActive to false)
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    if (DEBUG_LOG) console.log("TaskStorageService: Deleting task", { taskId });

    const now = new Date();

    try {
      const result = await this.db
        .update(schema.taskSpecification)
        .set({
          status: "cancelled",
          isActive: false,
          updatedBy: userId,
          updatedAt: now,
        })
        .where(eq(schema.taskSpecification.id, taskId))
        .returning();

      if (result.length === 0) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      // Create audit log
      await this.createAuditLog({
        entityType: 'task_specification',
        entityId: taskId,
        action: 'deleted',
        description: `Task '${result[0].name}' deleted`,
        userId,
      });

      if (DEBUG_LOG) console.log("TaskStorageService: Task deleted successfully", { id: taskId });
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error deleting task", error);
      throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: AuditAction;
    description?: string;
    oldValues?: any;
    newValues?: any;
    userId: string;
  }): Promise<void> {
    try {
      await this.db.insert(schema.taskAuditLog).values({
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        description: data.description,
        oldValues: data.oldValues,
        newValues: data.newValues,
        userId: data.userId,
      });
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskStorageService: Error creating audit log", error);
      // Don't throw here to avoid breaking the main operation
    }
  }

  /**
   * Map database task to interface
   */
  private mapDbTaskToInterface(dbTask: any): TaskSpecification {
    return {
      id: dbTask.id,
      taskId: dbTask.taskId,
      name: dbTask.name,
      category: dbTask.category,
      instructionPatient: dbTask.instructionPatient,
      instructionClinician: dbTask.instructionClinician,
      timing: {
        offsetDays: dbTask.timingOffsetDays,
        durationDays: dbTask.timingDurationDays,
        timeOfDay: dbTask.timingTimeOfDay,
        isFlexible: dbTask.timingIsFlexible,
      },
      conditions: {
        medications: dbTask.conditions?.medications || [],
        surgery_types: dbTask.conditions?.surgery_types || [],
        comorbidities: dbTask.conditions?.comorbidities || [],
      },
      evidence: {
        source: dbTask.evidenceSource,
        url: dbTask.evidenceUrl,
        level: dbTask.evidenceLevel,
        publicationDate: dbTask.evidencePublicationDate,
        notes: dbTask.evidenceNotes,
      },
      status: dbTask.status,
      priority: dbTask.priority,
      versionStatus: dbTask.versionStatus,
      version: dbTask.version,
      isTemplate: dbTask.isTemplate,
      createdAt: dbTask.createdAt,
      updatedAt: dbTask.updatedAt,
    };
  }
}