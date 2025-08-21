/**
 * Task Management System Types
 * Comprehensive type definitions for JSON task specifications,
 * version control, and storage architecture
 */

// Core task timing configuration
export interface TaskTiming {
  /** Number of days offset from a reference point (negative for before, positive for after) */
  offset_days: number;
  /** Duration of the task in days */
  duration_days: number;
  /** Optional specific time of day for task execution */
  time_of_day?: string;
  /** Whether this timing is flexible or strict */
  is_flexible?: boolean;
}

// Conditional logic for task applicability
export interface TaskConditions {
  /** Required medications for task to apply */
  medications?: string[];
  /** Surgery types this task applies to */
  surgery_types?: string[];
  /** Patient comorbidities that trigger this task */
  comorbidities?: string[];
  /** Age range requirements */
  age_range?: {
    min?: number;
    max?: number;
  };
  /** Gender requirements */
  gender?: 'male' | 'female' | 'any';
  /** Custom conditional expressions */
  custom_conditions?: string[];
}

// Evidence and reference information
export interface TaskEvidence {
  /** Source name or title */
  source: string;
  /** URL to the evidence source */
  url: string;
  /** Evidence level (A, B, C, etc.) */
  level?: string;
  /** Publication date */
  publication_date?: string;
  /** Additional notes about the evidence */
  notes?: string;
}

// Task dependency information
export interface TaskDependency {
  /** ID of the dependent task */
  task_id: string;
  /** Type of dependency */
  type: 'prerequisite' | 'concurrent' | 'sequential' | 'conditional';
  /** Optional delay after dependency completion */
  delay_days?: number;
  /** Condition that must be met for dependency */
  condition?: string;
}

// Task status tracking
export type TaskStatus = 
  | 'pending'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'deferred'
  | 'failed';

// Task priority levels
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task categories
export type TaskCategory = 
  | 'Medication'
  | 'Assessment'
  | 'Education'
  | 'Monitoring'
  | 'Procedure'
  | 'Documentation'
  | 'Communication'
  | 'Discharge'
  | 'Follow-up'
  | 'Other';

// Core task specification (matches the JSON format)
export interface TaskSpecification {
  /** Unique task identifier */
  id: string;
  /** Descriptive task name */
  name: string;
  /** Task category */
  category: TaskCategory;
  /** Instructions for the patient */
  instruction_patient: string;
  /** Instructions for the clinician */
  instruction_clinician: string;
  /** Timing parameters */
  timing: TaskTiming;
  /** Conditional logic */
  conditions: TaskConditions;
  /** Evidence references */
  evidence: TaskEvidence;
  /** Current status */
  status: TaskStatus;
  /** Task priority */
  priority?: TaskPriority;
  /** Task dependencies */
  dependencies?: TaskDependency[];
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Extended task with version control and audit information
export interface Task extends TaskSpecification {
  /** Database primary key */
  db_id?: string;
  /** Version number */
  version: string;
  /** Creation timestamp */
  created_at: string;
  /** Last modification timestamp */
  updated_at: string;
  /** User who created the task */
  created_by: string;
  /** User who last modified the task */
  updated_by: string;
  /** Whether this is the active version */
  is_active: boolean;
  /** Parent task ID for versioning */
  parent_task_id?: string;
  /** Validation status */
  is_valid: boolean;
  /** Validation errors */
  validation_errors?: string[];
}

// Task version history entry
export interface TaskVersion {
  /** Version identifier */
  version_id: string;
  /** Task ID this version belongs to */
  task_id: string;
  /** Version number */
  version: string;
  /** Complete task data at this version */
  task_data: TaskSpecification;
  /** Timestamp of this version */
  created_at: string;
  /** User who created this version */
  created_by: string;
  /** Change description */
  change_description?: string;
  /** Whether this version is active */
  is_active: boolean;
}

// Audit trail entry
export interface TaskAuditEntry {
  /** Audit entry ID */
  audit_id: string;
  /** Task ID */
  task_id: string;
  /** Action performed */
  action: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated' | 'validated';
  /** User who performed the action */
  user_id: string;
  /** Timestamp of the action */
  timestamp: string;
  /** Previous values (for updates) */
  previous_values?: Partial<TaskSpecification>;
  /** New values (for updates) */
  new_values?: Partial<TaskSpecification>;
  /** Additional context */
  context?: Record<string, any>;
  /** IP address or session info */
  session_info?: string;
}

// Task repository query parameters
export interface TaskQueryParams {
  /** Filter by task IDs */
  ids?: string[];
  /** Filter by category */
  category?: TaskCategory;
  /** Filter by status */
  status?: TaskStatus;
  /** Filter by priority */
  priority?: TaskPriority;
  /** Filter by surgery types */
  surgery_types?: string[];
  /** Filter by medications */
  medications?: string[];
  /** Filter by comorbidities */
  comorbidities?: string[];
  /** Search in task names and instructions */
  search_text?: string;
  /** Filter by creation date range */
  created_after?: string;
  created_before?: string;
  /** Filter by update date range */
  updated_after?: string;
  updated_before?: string;
  /** Filter by creator */
  created_by?: string;
  /** Only return active versions */
  active_only?: boolean;
  /** Include validation status */
  include_validation?: boolean;
  /** Pagination */
  limit?: number;
  offset?: number;
  /** Sorting */
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'priority' | 'category';
  sort_order?: 'asc' | 'desc';
}

// Task repository response
export interface TaskQueryResponse {
  /** Retrieved tasks */
  tasks: Task[];
  /** Total count (for pagination) */
  total_count: number;
  /** Query metadata */
  query_metadata: {
    limit: number;
    offset: number;
    sort_by: string;
    sort_order: string;
    execution_time_ms: number;
  };
}

// Task validation result
export interface TaskValidationResult {
  /** Whether the task is valid */
  is_valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Validation score (0-100) */
  score: number;
  /** Detailed validation breakdown */
  details: {
    structure_valid: boolean;
    timing_valid: boolean;
    conditions_valid: boolean;
    evidence_valid: boolean;
    dependencies_valid: boolean;
  };
}

// Task import/export formats
export interface TaskImportRequest {
  /** JSON task specifications to import */
  tasks: TaskSpecification[];
  /** Whether to validate before import */
  validate: boolean;
  /** Whether to overwrite existing tasks */
  overwrite_existing: boolean;
  /** User performing the import */
  imported_by: string;
  /** Import batch description */
  batch_description?: string;
}

export interface TaskImportResult {
  /** Number of tasks successfully imported */
  imported_count: number;
  /** Number of tasks that failed import */
  failed_count: number;
  /** Number of tasks skipped */
  skipped_count: number;
  /** Detailed results for each task */
  task_results: {
    task_id: string;
    status: 'imported' | 'failed' | 'skipped';
    error_message?: string;
    warnings?: string[];
  }[];
  /** Import batch ID for tracking */
  batch_id: string;
}

// Task export request
export interface TaskExportRequest {
  /** Query parameters for tasks to export */
  query: TaskQueryParams;
  /** Export format */
  format: 'json' | 'csv' | 'xlsx';
  /** Whether to include version history */
  include_history: boolean;
  /** Whether to include audit trail */
  include_audit: boolean;
}

// Care plan integration types
export interface TaskAssignment {
  /** Assignment ID */
  assignment_id: string;
  /** Task ID */
  task_id: string;
  /** Care plan ID */
  care_plan_id: string;
  /** Patient ID */
  patient_id: string;
  /** Assigned to user ID */
  assigned_to: string;
  /** Assignment date */
  assigned_at: string;
  /** Due date (calculated from timing) */
  due_date: string;
  /** Current status */
  status: TaskStatus;
  /** Completion date */
  completed_at?: string;
  /** Assignment notes */
  notes?: string;
  /** Override instructions */
  override_instructions?: {
    patient?: string;
    clinician?: string;
  };
}

// Task execution context
export interface TaskExecutionContext {
  /** Patient information */
  patient: {
    id: string;
    age: number;
    gender: 'male' | 'female';
    medications: string[];
    comorbidities: string[];
    allergies: string[];
  };
  /** Surgery information */
  surgery: {
    type: string;
    scheduled_date: string;
    surgeon: string;
    facility: string;
  };
  /** Care plan context */
  care_plan: {
    id: string;
    name: string;
    phase: string;
    start_date: string;
  };
  /** Current date for calculations */
  current_date: string;
}

// Task filtering and matching
export interface TaskMatchResult {
  /** Whether the task matches the context */
  matches: boolean;
  /** Matching score (0-100) */
  score: number;
  /** Reasons for match/no-match */
  reasons: string[];
  /** Calculated due date if applicable */
  calculated_due_date?: string;
  /** Any condition overrides */
  condition_overrides?: Record<string, any>;
}

// All types are exported individually above