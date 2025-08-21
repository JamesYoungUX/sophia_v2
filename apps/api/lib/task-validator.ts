/**
 * Task Validation Service
 * 
 * Provides comprehensive validation for task specifications including
 * dependencies, sequencing, conditional logic, and business rules.
 */

import type { DbSchema } from "@repo/db";
import { schema } from "@repo/db";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq, and, or, inArray } from "drizzle-orm";
import type {
  TaskSpecification,
  TaskValidationError,
  TaskValidationResult,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  DependencyType,
} from "../types/task-management";

const DEBUG_LOG = false;

if (DEBUG_LOG) console.log("TaskValidator: Initializing task validation service");

export interface ValidationContext {
  organizationId: string;
  teamId?: string;
  patientId?: string;
  carePlanId?: string;
  existingTasks?: TaskSpecification[];
  validationMode?: 'strict' | 'lenient';
}

export interface DependencyValidationResult {
  isValid: boolean;
  circularDependencies: string[];
  missingDependencies: string[];
  invalidDependencyTypes: string[];
}

export interface SequenceValidationResult {
  isValid: boolean;
  conflictingSequences: Array<{
    taskId: string;
    conflictWith: string;
    reason: string;
  }>;
  timingIssues: Array<{
    taskId: string;
    issue: string;
  }>;
}

export interface ConditionalValidationResult {
  isValid: boolean;
  unmetConditions: Array<{
    taskId: string;
    condition: string;
    reason: string;
  }>;
  conflictingConditions: Array<{
    taskId: string;
    conflictWith: string;
    reason: string;
  }>;
}

export class TaskValidator {
  constructor(private db: PostgresJsDatabase<DbSchema>) {
    if (DEBUG_LOG) console.log("TaskValidator: Service initialized");
  }

  /**
   * Validate a single task specification
   */
  async validateTask(
    task: TaskSpecification,
    context: ValidationContext
  ): Promise<TaskValidationResult> {
    if (DEBUG_LOG) console.log("TaskValidator: Validating task", { taskId: task.taskId, name: task.name });

    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    try {
      // Basic field validation
      const basicValidation = this.validateBasicFields(task);
      errors.push(...basicValidation.errors);
      warnings.push(...basicValidation.warnings);

      // Business rules validation
      const businessValidation = await this.validateBusinessRules(task, context);
      errors.push(...businessValidation.errors);
      warnings.push(...businessValidation.warnings);

      // Timing validation
      const timingValidation = this.validateTiming(task);
      errors.push(...timingValidation.errors);
      warnings.push(...timingValidation.warnings);

      // Conditions validation
      const conditionsValidation = this.validateConditions(task);
      errors.push(...conditionsValidation.errors);
      warnings.push(...conditionsValidation.warnings);

      // Evidence validation
      const evidenceValidation = this.validateEvidence(task);
      errors.push(...evidenceValidation.errors);
      warnings.push(...evidenceValidation.warnings);

      const isValid = errors.length === 0;
      
      if (DEBUG_LOG) console.log("TaskValidator: Task validation completed", { 
        taskId: task.taskId, 
        isValid, 
        errorCount: errors.length, 
        warningCount: warnings.length 
      });

      return {
        isValid,
        errors,
        warnings,
        score: isValid ? 100 : Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5)),
      };
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskValidator: Error during validation", error);
      
      errors.push({
        field: 'general',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'VALIDATION_ERROR',
        severity: 'error',
      });

      return {
        isValid: false,
        errors,
        warnings,
        score: 0,
      };
    }
  }

  /**
   * Validate multiple tasks and their dependencies
   */
  async validateTaskBatch(
    tasks: TaskSpecification[],
    context: ValidationContext
  ): Promise<{
    overallValid: boolean;
    taskResults: TaskValidationResult[];
    dependencyValidation: DependencyValidationResult;
    sequenceValidation: SequenceValidationResult;
    conditionalValidation: ConditionalValidationResult;
  }> {
    if (DEBUG_LOG) console.log("TaskValidator: Validating task batch", { count: tasks.length });

    // Validate individual tasks
    const taskResults = await Promise.all(
      tasks.map(task => this.validateTask(task, context))
    );

    // Validate dependencies between tasks
    const dependencyValidation = await this.validateDependencies(tasks, context);

    // Validate sequencing
    const sequenceValidation = this.validateSequencing(tasks);

    // Validate conditional logic
    const conditionalValidation = this.validateConditionalLogic(tasks);

    const overallValid = 
      taskResults.every(result => result.isValid) &&
      dependencyValidation.isValid &&
      sequenceValidation.isValid &&
      conditionalValidation.isValid;

    if (DEBUG_LOG) console.log("TaskValidator: Batch validation completed", { 
      overallValid,
      taskCount: tasks.length,
      validTasks: taskResults.filter(r => r.isValid).length
    });

    return {
      overallValid,
      taskResults,
      dependencyValidation,
      sequenceValidation,
      conditionalValidation,
    };
  }

  /**
   * Validate basic required fields
   */
  private validateBasicFields(task: TaskSpecification): {
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
  } {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    // Required fields
    if (!task.taskId || task.taskId.trim() === '') {
      errors.push({
        field: 'taskId',
        message: 'Task ID is required',
        code: 'REQUIRED_FIELD',
        severity: 'error',
      });
    }

    if (!task.name || task.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Task name is required',
        code: 'REQUIRED_FIELD',
        severity: 'error',
      });
    }

    if (!task.instructionPatient || task.instructionPatient.trim() === '') {
      errors.push({
        field: 'instructionPatient',
        message: 'Patient instruction is required',
        code: 'REQUIRED_FIELD',
        severity: 'error',
      });
    }

    if (!task.instructionClinician || task.instructionClinician.trim() === '') {
      errors.push({
        field: 'instructionClinician',
        message: 'Clinician instruction is required',
        code: 'REQUIRED_FIELD',
        severity: 'error',
      });
    }

    // Field length validation
    if (task.name && task.name.length > 200) {
      errors.push({
        field: 'name',
        message: 'Task name must be 200 characters or less',
        code: 'FIELD_LENGTH',
        severity: 'error',
      });
    }

    if (task.instructionPatient && task.instructionPatient.length > 2000) {
      warnings.push({
        field: 'instructionPatient',
        message: 'Patient instruction is very long (>2000 characters)',
        code: 'FIELD_LENGTH',
        severity: 'warning',
      });
    }

    if (task.instructionClinician && task.instructionClinician.length > 2000) {
      warnings.push({
        field: 'instructionClinician',
        message: 'Clinician instruction is very long (>2000 characters)',
        code: 'FIELD_LENGTH',
        severity: 'warning',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    task: TaskSpecification,
    context: ValidationContext
  ): Promise<{
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
  }> {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    // Check for duplicate task IDs in organization
    try {
      const existingTask = await this.db
        .select({ id: schema.taskSpecification.id })
        .from(schema.taskSpecification)
        .where(
          and(
            eq(schema.taskSpecification.taskId, task.taskId),
            eq(schema.taskSpecification.organizationId, context.organizationId),
            eq(schema.taskSpecification.isActive, true)
          )
        )
        .limit(1);

      if (existingTask.length > 0 && existingTask[0].id !== task.id) {
        errors.push({
          field: 'taskId',
          message: `Task ID '${task.taskId}' already exists in this organization`,
          code: 'DUPLICATE_TASK_ID',
          severity: 'error',
        });
      }
    } catch (error) {
      if (DEBUG_LOG) console.error("TaskValidator: Error checking duplicate task ID", error);
      warnings.push({
        field: 'taskId',
        message: 'Could not verify task ID uniqueness',
        code: 'VALIDATION_WARNING',
        severity: 'warning',
      });
    }

    // Template validation
    if (task.isTemplate && task.status !== 'pending') {
      warnings.push({
        field: 'status',
        message: 'Template tasks should typically have pending status',
        code: 'TEMPLATE_STATUS',
        severity: 'warning',
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate timing configuration
   */
  private validateTiming(task: TaskSpecification): {
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
  } {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    if (task.timing) {
      // Offset days validation
      if (task.timing.offsetDays !== undefined) {
        if (task.timing.offsetDays < -365 || task.timing.offsetDays > 365) {
          errors.push({
            field: 'timing.offsetDays',
            message: 'Offset days must be between -365 and 365',
            code: 'INVALID_RANGE',
            severity: 'error',
          });
        }
      }

      // Duration validation
      if (task.timing.durationDays !== undefined) {
        if (task.timing.durationDays < 1 || task.timing.durationDays > 365) {
          errors.push({
            field: 'timing.durationDays',
            message: 'Duration must be between 1 and 365 days',
            code: 'INVALID_RANGE',
            severity: 'error',
          });
        }
      }

      // Time of day validation
      if (task.timing.timeOfDay) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(task.timing.timeOfDay)) {
          errors.push({
            field: 'timing.timeOfDay',
            message: 'Time of day must be in HH:MM format (24-hour)',
            code: 'INVALID_FORMAT',
            severity: 'error',
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate conditions
   */
  private validateConditions(task: TaskSpecification): {
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
  } {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    if (task.conditions) {
      // Medications validation
      if (task.conditions.medications) {
        if (task.conditions.medications.length > 50) {
          warnings.push({
            field: 'conditions.medications',
            message: 'Large number of medications specified (>50)',
            code: 'LARGE_LIST',
            severity: 'warning',
          });
        }

        // Check for empty medication names
        const emptyMeds = task.conditions.medications.filter(med => !med || med.trim() === '');
        if (emptyMeds.length > 0) {
          errors.push({
            field: 'conditions.medications',
            message: 'Medication names cannot be empty',
            code: 'INVALID_VALUE',
            severity: 'error',
          });
        }
      }

      // Surgery types validation
      if (task.conditions.surgery_types) {
        if (task.conditions.surgery_types.length > 20) {
          warnings.push({
            field: 'conditions.surgery_types',
            message: 'Large number of surgery types specified (>20)',
            code: 'LARGE_LIST',
            severity: 'warning',
          });
        }
      }

      // Comorbidities validation
      if (task.conditions.comorbidities) {
        if (task.conditions.comorbidities.length > 30) {
          warnings.push({
            field: 'conditions.comorbidities',
            message: 'Large number of comorbidities specified (>30)',
            code: 'LARGE_LIST',
            severity: 'warning',
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate evidence
   */
  private validateEvidence(task: TaskSpecification): {
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
  } {
    const errors: TaskValidationError[] = [];
    const warnings: TaskValidationError[] = [];

    if (task.evidence) {
      // URL validation
      if (task.evidence.url) {
        try {
          new URL(task.evidence.url);
        } catch {
          errors.push({
            field: 'evidence.url',
            message: 'Evidence URL is not valid',
            code: 'INVALID_URL',
            severity: 'error',
          });
        }
      }

      // Publication date validation
      if (task.evidence.publicationDate) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(task.evidence.publicationDate)) {
          errors.push({
            field: 'evidence.publicationDate',
            message: 'Publication date must be in YYYY-MM-DD format',
            code: 'INVALID_FORMAT',
            severity: 'error',
          });
        } else {
          const date = new Date(task.evidence.publicationDate);
          const now = new Date();
          if (date > now) {
            warnings.push({
              field: 'evidence.publicationDate',
              message: 'Publication date is in the future',
              code: 'FUTURE_DATE',
              severity: 'warning',
            });
          }
        }
      }

      // Evidence level validation
      if (task.evidence.level) {
        const validLevels = ['1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '4', '5'];
        if (!validLevels.includes(task.evidence.level.toLowerCase())) {
          warnings.push({
            field: 'evidence.level',
            message: 'Evidence level should follow standard hierarchy (1a-5)',
            code: 'INVALID_EVIDENCE_LEVEL',
            severity: 'warning',
          });
        }
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate dependencies between tasks
   */
  private async validateDependencies(
    tasks: TaskSpecification[],
    context: ValidationContext
  ): Promise<DependencyValidationResult> {
    if (DEBUG_LOG) console.log("TaskValidator: Validating dependencies");

    const circularDependencies: string[] = [];
    const missingDependencies: string[] = [];
    const invalidDependencyTypes: string[] = [];

    // For now, return a basic validation result
    // This would be expanded to check actual dependency relationships
    // when the dependency system is fully implemented

    return {
      isValid: circularDependencies.length === 0 && missingDependencies.length === 0,
      circularDependencies,
      missingDependencies,
      invalidDependencyTypes,
    };
  }

  /**
   * Validate task sequencing
   */
  private validateSequencing(tasks: TaskSpecification[]): SequenceValidationResult {
    if (DEBUG_LOG) console.log("TaskValidator: Validating sequencing");

    const conflictingSequences: Array<{
      taskId: string;
      conflictWith: string;
      reason: string;
    }> = [];
    
    const timingIssues: Array<{
      taskId: string;
      issue: string;
    }> = [];

    // Check for timing conflicts
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];

        if (task1.timing && task2.timing) {
          // Check for overlapping timing windows
          const task1Start = task1.timing.offsetDays || 0;
          const task1End = task1Start + (task1.timing.durationDays || 1);
          const task2Start = task2.timing.offsetDays || 0;
          const task2End = task2Start + (task2.timing.durationDays || 1);

          if (task1Start < task2End && task2Start < task1End) {
            // Check if they have the same time of day (potential conflict)
            if (task1.timing.timeOfDay === task2.timing.timeOfDay && task1.timing.timeOfDay) {
              conflictingSequences.push({
                taskId: task1.taskId,
                conflictWith: task2.taskId,
                reason: `Both tasks scheduled at ${task1.timing.timeOfDay} with overlapping date ranges`,
              });
            }
          }
        }
      }
    }

    return {
      isValid: conflictingSequences.length === 0 && timingIssues.length === 0,
      conflictingSequences,
      timingIssues,
    };
  }

  /**
   * Validate conditional logic
   */
  private validateConditionalLogic(tasks: TaskSpecification[]): ConditionalValidationResult {
    if (DEBUG_LOG) console.log("TaskValidator: Validating conditional logic");

    const unmetConditions: Array<{
      taskId: string;
      condition: string;
      reason: string;
    }> = [];
    
    const conflictingConditions: Array<{
      taskId: string;
      conflictWith: string;
      reason: string;
    }> = [];

    // Check for conflicting medication conditions
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i];
        const task2 = tasks[j];

        if (task1.conditions?.medications && task2.conditions?.medications) {
          const commonMeds = task1.conditions.medications.filter(med => 
            task2.conditions?.medications?.includes(med)
          );

          if (commonMeds.length > 0) {
            // This could be a conflict or a valid shared condition
            // For now, we'll just note it as a potential issue
            if (task1.category !== task2.category) {
              conflictingConditions.push({
                taskId: task1.taskId,
                conflictWith: task2.taskId,
                reason: `Both tasks have medication conditions for: ${commonMeds.join(', ')}`,
              });
            }
          }
        }
      }
    }

    return {
      isValid: unmetConditions.length === 0 && conflictingConditions.length === 0,
      unmetConditions,
      conflictingConditions,
    };
  }
}

/**
 * Factory function to create TaskValidator instance
 */
export function createTaskValidator(db: PostgresJsDatabase<DbSchema>): TaskValidator {
  return new TaskValidator(db);
}