/**
 * TypeScript type definitions for Task Management System
 * 
 * This file contains all the type definitions used throughout the task management
 * system, including interfaces for task specifications, validation results,
 * import/export operations, and integration with care plans.
 */

export interface TaskSpecification {
  id: string;
  taskId: string; // Business ID from JSON
  name: string;
  category: TaskCategory;
  instructionPatient: string;
  instructionClinician: string;
  timing?: TaskTiming;
  conditions?: TaskConditions;
  evidence?: TaskEvidence;
  status: TaskStatus;
  priority: TaskPriority;
  versionStatus: TaskVersionStatus;
  version: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTiming {
  offsetDays: number;
  durationDays: number;
  timeOfDay?: string;
  isFlexible: boolean;
}

export interface TaskConditions {
  medications?: string[];
  surgery_types?: string[];
  comorbidities?: string[];
}

export interface TaskEvidence {
  source: string;
  url: string;
  level?: string;
  publicationDate?: string;
  notes?: string;
}

export interface TaskValidationError {
  field: string;
  message: string;
  code: string;
  value: unknown;
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
  validationScore: number;
  structureValid: boolean;
  timingValid: boolean;
  conditionsValid: boolean;
  evidenceValid: boolean;
  dependenciesValid: boolean;
}

export interface TaskImportResult {
  success: boolean;
  taskId: string;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
  parsedTask: TaskSpecification | null;
  validationResult: TaskValidationResult | null;
}

export interface TaskBatchImportResult {
  totalTasks: number;
  successCount: number;
  failureCount: number;
  results: TaskImportResult[];
  summary: {
    errors: TaskValidationError[];
    warnings: TaskValidationError[];
    duplicateIds: string[];
  };
}

export type TaskCategory = 
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

export type TaskStatus = 
  | "pending"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "deferred"
  | "failed";

export type TaskPriority = 
  | "low"
  | "medium"
  | "high"
  | "critical";

export type DependencyType = 
  | "prerequisite"
  | "concurrent"
  | "sequential"
  | "conditional";

export type ImportStatus = 
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "partial";

export type TaskVersionStatus = 
  | "draft"
  | "active"
  | "inactive";

export type TaskAuditAction = 
  | "created"
  | "updated"
  | "deleted"
  | "activated"
  | "deactivated"
  | "validated"
  | "assigned"
  | "executed"
  | "completed"
  | "failed";