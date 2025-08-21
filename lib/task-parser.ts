/**
 * Task Parser and Validation System
 *
 * This module provides comprehensive JSON task parsing, validation, and error handling
 * for the task management system. It validates task specifications against the defined
 * schema and provides detailed error reporting for debugging and user feedback.
 *
 * Features:
 * - JSON schema validation using Zod
 * - Detailed error reporting with field-level validation
 * - Support for conditional logic validation
 * - Evidence URL validation
 * - Timing parameter validation
 * - Batch parsing for multiple tasks
 * - Import result tracking
 */

import { z } from "zod";
import type {
  TaskSpecification,
  TaskValidationResult,
  TaskValidationError,
  TaskImportResult,
  TaskBatchImportResult,
} from "../types/task-management";

const DEBUG_LOG = false;

// Zod schemas for validation
const TaskTimingSchema = z.object({
  offset_days: z.number().int().min(-365, "Offset days must be between -365 and 365").max(365, "Offset days must be between -365 and 365"),
  duration_days: z.number().int().min(1, "Duration must be at least 1 day").max(365, "Duration cannot exceed 365 days"),
  time_of_day: z.string().optional(),
  is_flexible: z.boolean().optional().default(false),
});

const TaskConditionsSchema = z.object({
  medications: z.array(z.string()).optional().default([]),
  surgery_types: z.array(z.string()).optional().default([]),
  comorbidities: z.array(z.string()).optional().default([]),
  age_range: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  custom_conditions: z.record(z.string(), z.unknown()).optional(),
});

const TaskEvidenceSchema = z.object({
  source: z.string().min(1, "Evidence source is required"),
  url: z.string().url("Evidence URL must be a valid URL"),
  level: z.string().optional(),
  publication_date: z.string().optional(),
  notes: z.string().optional(),
});

const TaskSpecificationSchema = z.object({
  id: z.string().min(1, "Task ID is required"),
  name: z.string().min(1, "Task name is required"),
  category: z.enum([
    "Medication",
    "Assessment",
    "Education",
    "Monitoring",
    "Procedure",
    "Documentation",
    "Communication",
    "Discharge",
    "Follow-up",
    "Other",
  ]),
  instruction_patient: z.string().min(1, "Patient instruction is required"),
  instruction_clinician: z.string().min(1, "Clinician instruction is required"),
  timing: TaskTimingSchema,
  conditions: TaskConditionsSchema,
  evidence: TaskEvidenceSchema,
  status: z.enum(["pending", "scheduled", "in_progress", "completed", "cancelled", "deferred", "failed"]).optional().default("pending"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional().default("medium"),
  version: z.string().optional().default("1.0.0"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Validates a single task specification against the schema
 */
export function validateTaskSpecification(taskData: unknown): TaskValidationResult {
  if (DEBUG_LOG) console.log("Validating task specification:", taskData);
  
  const result: TaskValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    validationScore: 0,
    structureValid: false,
    timingValid: false,
    conditionsValid: false,
    evidenceValid: false,
    dependenciesValid: true, // Will be validated separately
  };

  try {
    // Parse and validate the task specification
    const parsed = TaskSpecificationSchema.parse(taskData);
    
    if (DEBUG_LOG) console.log("Task specification parsed successfully:", parsed);
    
    // Basic structure validation passed
    result.structureValid = true;
    
    // Validate timing parameters
    result.timingValid = validateTiming(parsed.timing, result);
    
    // Validate conditions
    result.conditionsValid = validateConditions(parsed.conditions, result);
    
    // Validate evidence
    result.evidenceValid = validateEvidence(parsed.evidence, result);
    
    // Calculate overall validation score
    result.validationScore = calculateValidationScore(result);
    
    // Task is valid if all components are valid and score is above threshold
    result.isValid = result.structureValid && 
                    result.timingValid && 
                    result.conditionsValid && 
                    result.evidenceValid && 
                    result.validationScore >= 0.8;
    
    if (DEBUG_LOG) console.log("Validation result:", result);
    
  } catch (err) {
    if (DEBUG_LOG) console.error("Validation error:", err);
    
    if (err instanceof z.ZodError) {
      // Handle Zod validation errors
      result.errors = err.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        value: issue.input,
      }));
    } else {
      // Handle other errors
      result.errors = [{
        field: 'general',
        message: err instanceof Error ? err.message : 'Unknown validation error',
        code: 'unknown_error',
        value: taskData,
      }];
    }
  }

  return result;
}

/**
 * Validates timing parameters and adds specific warnings/errors
 */
function validateTiming(timing: z.infer<typeof TaskTimingSchema>, result: TaskValidationResult): boolean {
  if (DEBUG_LOG) console.log("Validating timing:", timing);
  
  let isValid = true;

  // Check for reasonable offset ranges
  if (Math.abs(timing.offset_days) > 180) {
    result.warnings.push({
      field: 'timing.offset_days',
      message: 'Offset days is unusually large (>180 days)',
      code: 'unusual_offset',
      value: timing.offset_days,
    });
  }

  // Check for reasonable duration
  if (timing.duration_days > 90) {
    result.warnings.push({
      field: 'timing.duration_days',
      message: 'Duration is unusually long (>90 days)',
      code: 'long_duration',
      value: timing.duration_days,
    });
  }

  // Validate time of day format if provided
  if (timing.time_of_day) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timing.time_of_day)) {
      result.errors.push({
        field: 'timing.time_of_day',
        message: 'Time of day must be in HH:MM format',
        code: 'invalid_time_format',
        value: timing.time_of_day,
      });
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Validates conditions and checks for logical consistency
 */
function validateConditions(conditions: z.infer<typeof TaskConditionsSchema>, result: TaskValidationResult): boolean {
  if (DEBUG_LOG) console.log("Validating conditions:", conditions);
  
  let isValid = true;

  // Check if at least one condition is specified
  const hasConditions = (
    (conditions.medications && conditions.medications.length > 0) ||
    (conditions.surgery_types && conditions.surgery_types.length > 0) ||
    (conditions.comorbidities && conditions.comorbidities.length > 0) ||
    conditions.age_range ||
    (conditions.custom_conditions && Object.keys(conditions.custom_conditions).length > 0)
  );

  if (!hasConditions) {
    result.warnings.push({
      field: 'conditions',
      message: 'No conditions specified - task will apply to all patients',
      code: 'no_conditions',
      value: conditions,
    });
  }

  // Validate age range if provided
  if (conditions.age_range) {
    if (conditions.age_range.min && conditions.age_range.max) {
      if (conditions.age_range.min >= conditions.age_range.max) {
        result.errors.push({
          field: 'conditions.age_range',
          message: 'Minimum age must be less than maximum age',
          code: 'invalid_age_range',
          value: conditions.age_range,
        });
        isValid = false;
      }
    }
    
    if (conditions.age_range.min && conditions.age_range.min < 0) {
      result.errors.push({
        field: 'conditions.age_range.min',
        message: 'Minimum age cannot be negative',
        code: 'negative_age',
        value: conditions.age_range.min,
      });
      isValid = false;
    }
    
    if (conditions.age_range.max && conditions.age_range.max > 150) {
      result.warnings.push({
        field: 'conditions.age_range.max',
        message: 'Maximum age is unusually high (>150)',
        code: 'high_age',
        value: conditions.age_range.max,
      });
    }
  }

  return isValid;
}

/**
 * Validates evidence references and URLs
 */
function validateEvidence(evidence: z.infer<typeof TaskEvidenceSchema>, result: TaskValidationResult): boolean {
  if (DEBUG_LOG) console.log("Validating evidence:", evidence);
  
  let isValid = true;

  // Additional URL validation beyond basic format
  try {
    const url = new URL(evidence.url);
    
    // Check for secure protocols
    if (!['https:', 'http:'].includes(url.protocol)) {
      result.warnings.push({
        field: 'evidence.url',
        message: 'Evidence URL should use HTTP or HTTPS protocol',
        code: 'insecure_protocol',
        value: evidence.url,
      });
    }
    
    // Warn about non-HTTPS URLs
    if (url.protocol === 'http:') {
      result.warnings.push({
        field: 'evidence.url',
        message: 'Evidence URL should use HTTPS for security',
        code: 'non_https',
        value: evidence.url,
      });
    }
  } catch {
    result.errors.push({
      field: 'evidence.url',
      message: 'Evidence URL is not a valid URL',
      code: 'invalid_url',
      value: evidence.url,
    });
    isValid = false;
  }

  // Validate evidence level if provided
  if (evidence.level) {
    const validLevels = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '4', '5'];
    if (!validLevels.includes(evidence.level)) {
      result.warnings.push({
        field: 'evidence.level',
        message: 'Evidence level should follow standard classification (1A-5)',
        code: 'non_standard_level',
        value: evidence.level,
      });
    }
  }

  return isValid;
}

/**
 * Calculates a validation score based on various factors
 */
function calculateValidationScore(result: TaskValidationResult): number {
  let score = 1.0;
  
  // Deduct points for errors (major issues)
  score -= result.errors.length * 0.2;
  
  // Deduct smaller amounts for warnings (minor issues)
  score -= result.warnings.length * 0.05;
  
  // Ensure score doesn't go below 0
  return Math.max(0, score);
}

/**
 * Parses a single JSON task specification
 */
export function parseTaskSpecification(jsonData: string | object): TaskImportResult {
  if (DEBUG_LOG) console.log("Parsing task specification:", jsonData);
  
  const result: TaskImportResult = {
    success: false,
    taskId: '',
    errors: [],
    warnings: [],
    parsedTask: null,
    validationResult: null,
  };

  try {
    // Parse JSON if string provided
    const taskData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    // Extract task ID for tracking
    result.taskId = taskData.id || 'unknown';
    
    // Validate the task specification
    const validation = validateTaskSpecification(taskData);
    result.validationResult = validation;
    
    if (validation.isValid) {
      // Parse successful - convert to internal format
      result.parsedTask = convertToTaskSpecification(taskData);
      result.success = true;
      
      if (DEBUG_LOG) console.log("Task parsed successfully:", result.parsedTask);
    } else {
      // Validation failed
      result.errors = validation.errors;
      result.warnings = validation.warnings;
      
      if (DEBUG_LOG) console.log("Task validation failed:", validation.errors);
    }
    
  } catch (err) {
    if (DEBUG_LOG) console.error("Parse error:", err);
    
    result.errors = [{
      field: 'json',
      message: err instanceof Error ? err.message : 'Failed to parse JSON',
      code: 'parse_error',
      value: jsonData,
    }];
  }

  return result;
}

/**
 * Parses multiple task specifications from an array
 */
export function parseTaskBatch(jsonArray: string | object[]): TaskBatchImportResult {
  if (DEBUG_LOG) console.log("Parsing task batch:", jsonArray);
  
  const result: TaskBatchImportResult = {
    totalTasks: 0,
    successCount: 0,
    failureCount: 0,
    results: [],
    summary: {
      errors: [],
      warnings: [],
      duplicateIds: [],
    },
  };

  try {
    // Parse JSON if string provided
    const tasksArray = typeof jsonArray === 'string' ? JSON.parse(jsonArray) : jsonArray;
    
    if (!Array.isArray(tasksArray)) {
      throw new Error('Input must be an array of task specifications');
    }
    
    result.totalTasks = tasksArray.length;
    const seenIds = new Set<string>();
    
    // Process each task
    for (let i = 0; i < tasksArray.length; i++) {
      const taskResult = parseTaskSpecification(tasksArray[i]);
      
      // Check for duplicate IDs
      if (taskResult.taskId && seenIds.has(taskResult.taskId)) {
        result.summary.duplicateIds.push(taskResult.taskId);
        taskResult.errors.push({
          field: 'id',
          message: `Duplicate task ID: ${taskResult.taskId}`,
          code: 'duplicate_id',
          value: taskResult.taskId,
        });
        taskResult.success = false;
      } else if (taskResult.taskId) {
        seenIds.add(taskResult.taskId);
      }
      
      result.results.push(taskResult);
      
      if (taskResult.success) {
        result.successCount++;
      } else {
        result.failureCount++;
        // Collect errors for summary
        result.summary.errors.push(...taskResult.errors);
      }
      
      // Collect warnings for summary
      result.summary.warnings.push(...taskResult.warnings);
    }
    
    if (DEBUG_LOG) console.log("Batch parsing completed:", result);
    
  } catch (error) {
    if (DEBUG_LOG) console.error("Batch parse error:", error);
    
    result.summary.errors = [{
      field: 'batch',
      message: error instanceof Error ? error.message : 'Failed to parse task batch',
      code: 'batch_parse_error',
      value: jsonArray,
    }];
  }

  return result;
}

/**
 * Converts validated JSON data to internal TaskSpecification format
 */
function convertToTaskSpecification(taskData: z.infer<typeof TaskSpecificationSchema>): TaskSpecification {
  return {
    taskId: taskData.id,
    name: taskData.name,
    category: taskData.category,
    instructionPatient: taskData.instruction_patient,
    instructionClinician: taskData.instruction_clinician,
    timing: {
      offsetDays: taskData.timing.offset_days,
      durationDays: taskData.timing.duration_days,
      timeOfDay: taskData.timing.time_of_day,
      isFlexible: taskData.timing.is_flexible || false,
    },
    conditions: taskData.conditions,
    evidence: {
      source: taskData.evidence.source,
      url: taskData.evidence.url,
      level: taskData.evidence.level,
      publicationDate: taskData.evidence.publication_date,
      notes: taskData.evidence.notes,
    },
    status: taskData.status || 'pending',
    priority: taskData.priority || 'medium',
    version: taskData.version || '1.0.0',
    metadata: taskData.metadata || {},
  };
}

/**
 * Utility function to format validation errors for display
 */
export function formatValidationErrors(errors: TaskValidationError[]): string {
  return errors.map(error => 
    `${error.field}: ${error.message}`
  ).join('\n');
}

/**
 * Utility function to format validation warnings for display
 */
export function formatValidationWarnings(warnings: TaskValidationError[]): string {
  return warnings.map(warning => 
    `${warning.field}: ${warning.message}`
  ).join('\n');
}