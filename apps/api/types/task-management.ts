/**
 * TypeScript interfaces for Task Management System
 * 
 * These interfaces define the structure for task specifications,
 * validation results, and import operations.
 */

export type TaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'deferred' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskCategory = 'Medication' | 'Assessment' | 'Education' | 'Monitoring' | 'Procedure' | 'Documentation' | 'Communication' | 'Discharge' | 'Follow-up' | 'Other';
export type TaskVersionStatus = 'draft' | 'active' | 'inactive';
export type DependencyType = 'prerequisite' | 'concurrent' | 'sequential' | 'conditional';
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
export type AuditAction = 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'validated' | 'assigned' | 'executed' | 'completed' | 'failed';

export interface TaskTiming {
  offsetDays?: number;
  durationDays?: number;
  timeOfDay?: string;
  isFlexible?: boolean;
}

export interface TaskConditions {
  medications?: string[];
  surgery_types?: string[];
  comorbidities?: string[];
}

export interface TaskEvidence {
  source?: string;
  url?: string;
  level?: string;
  publicationDate?: string;
  notes?: string;
}

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

export interface TaskValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
  score: number;
}

export interface TaskImportResult {
  taskId: string;
  success: boolean;
  errors: TaskValidationError[];
  warnings: TaskValidationError[];
  created: boolean;
  updated: boolean;
}

export interface TaskBatchImportResult {
  batchId: string;
  totalTasks: number;
  importedCount: number;
  failedCount: number;
  skippedCount: number;
  results: TaskImportResult[];
  status: ImportStatus;
  errors: TaskValidationError[];
}