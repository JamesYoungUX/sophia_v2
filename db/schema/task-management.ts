/**
 * Database schema for Task Management System.
 *
 * This schema provides a comprehensive task repository for storing and organizing
 * task specifications with version control, audit trails, and integration with
 * care plans. Supports JSON task definitions, conditional logic, evidence tracking,
 * and task execution context.
 *
 * Tables defined:
 * - `taskSpecification`: Core task definitions with JSON specifications
 * - `taskVersion`: Version control with complete revision history
 * - `taskAuditLog`: Comprehensive audit trail for all task activities
 * - `taskDependency`: Task dependencies and sequencing relationships
 * - `taskAssignment`: Task assignments to care plans and patients
 * - `taskExecution`: Task execution tracking and status updates
 * - `taskValidation`: Task validation results and error tracking
 * - `taskImportBatch`: Batch import tracking for JSON task specifications
 *
 * SPDX-FileCopyrightText: 2014-present Kriasoft
 * SPDX-License-Identifier: MIT
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { carePlan } from "./care-plan";
import { organization } from "./organization";
import { patient } from "./patient";
import { team } from "./team";
import { user } from "./user";

// Enums for type safety
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "deferred",
  "failed",
]);

export const taskVersionStatusEnum = pgEnum("task_version_status", [
  "draft",
  "active",
  "inactive",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const taskCategoryEnum = pgEnum("task_category", [
  "Education",
  "Lifestyle/Health",
  "Logistics",
  "Medical",
]);

export const dependencyTypeEnum = pgEnum("dependency_type", [
  "prerequisite",
  "concurrent",
  "sequential",
  "conditional",
]);

export const taskAuditActionEnum = pgEnum("task_audit_action", [
  "created",
  "updated",
  "deleted",
  "activated",
  "deactivated",
  "validated",
  "assigned",
  "executed",
  "completed",
  "failed",
]);

export const importStatusEnum = pgEnum("import_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "partial",
]);

/**
 * Core task specifications with JSON definitions.
 * Stores the complete task specification including timing, conditions, and evidence.
 */
export const taskSpecification = pgTable(
  "task_specification",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    taskId: text("task_id").notNull().unique(), // Business ID from JSON
    name: text("name").notNull(),
    category: taskCategoryEnum("category").notNull(),
    instructionPatient: text("instruction_patient").notNull(),
    instructionClinician: text("instruction_clinician").notNull(),

    // Timing configuration
    timingOffsetDays: integer("timing_offset_days").notNull(),
    timingDurationDays: integer("timing_duration_days").notNull(),
    timingTimeOfDay: text("timing_time_of_day"),
    timingIsFlexible: boolean("timing_is_flexible").default(false),

    // Conditional logic (stored as JSONB for flexibility)
    conditions: jsonb("conditions").notNull(), // medications, surgery_types, comorbidities, etc.

    // Evidence and references
    evidenceSource: text("evidence_source").notNull(),
    evidenceUrl: text("evidence_url").notNull(),
    evidenceLevel: text("evidence_level"),
    evidencePublicationDate: text("evidence_publication_date"),
    evidenceNotes: text("evidence_notes"),

    // Status and lifecycle
    status: taskStatusEnum("status").notNull().default("pending"),
    priority: taskPriorityEnum("priority").default("medium"),
    versionStatus: taskVersionStatusEnum("version_status")
      .notNull()
      .default("draft"),
    version: text("version").notNull().default("1.0.0"),
    isActive: boolean("is_active").notNull().default(true),
    isTemplate: boolean("is_template").notNull().default(true),

    // Validation status
    isValid: boolean("is_valid").notNull().default(false),
    validationErrors: jsonb("validation_errors"),
    validationScore: real("validation_score").default(0),

    // Organization and ownership
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    teamId: text("team_id").references(() => team.id, {
      onDelete: "set null",
    }),

    // Additional metadata
    metadata: jsonb("metadata"),
    searchVector: text("search_vector"), // Full-text search

    // Timestamps and audit
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    updatedBy: text("updated_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    taskIdIdx: index("task_spec_task_id_idx").on(table.taskId),
    nameIdx: index("task_spec_name_idx").on(table.name),
    categoryIdx: index("task_spec_category_idx").on(table.category),
    statusIdx: index("task_spec_status_idx").on(table.status),
    priorityIdx: index("task_spec_priority_idx").on(table.priority),
    versionStatusIdx: index("task_spec_version_status_idx").on(
      table.versionStatus,
    ),
    orgIdx: index("task_spec_org_idx").on(table.organizationId),
    teamIdx: index("task_spec_team_idx").on(table.teamId),
    activeIdx: index("task_spec_active_idx").on(table.isActive),
    validIdx: index("task_spec_valid_idx").on(table.isValid),
    searchIdx: index("task_spec_search_idx").on(table.searchVector),
    conditionsIdx: index("task_spec_conditions_idx").using(
      "gin",
      table.conditions,
    ),
  }),
);

/**
 * Version control system for task specifications.
 * Maintains complete revision history with change tracking.
 */
export const taskVersion = pgTable(
  "task_version",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    taskSpecificationId: text("task_specification_id")
      .notNull()
      .references(() => taskSpecification.id, { onDelete: "cascade" }),
    version: text("version").notNull(),
    versionStatus: taskVersionStatusEnum("version_status")
      .notNull()
      .default("draft"),
    taskData: jsonb("task_data").notNull(), // Complete task specification at this version
    changeDescription: text("change_description"),
    changesSummary: jsonb("changes_summary"), // Structured diff
    isActive: boolean("is_active").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    taskVersionIdx: index("task_version_task_idx").on(
      table.taskSpecificationId,
      table.version,
    ),
    versionStatusIdx: index("task_version_version_status_idx").on(
      table.versionStatus,
    ),
    activeIdx: index("task_version_active_idx").on(table.isActive),
    createdAtIdx: index("task_version_created_idx").on(table.createdAt),
  }),
);

/**
 * Task dependencies and sequencing relationships.
 * Defines how tasks relate to each other in execution order.
 */
export const taskDependency = pgTable(
  "task_dependency",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    sourceTaskId: text("source_task_id")
      .notNull()
      .references(() => taskSpecification.id, { onDelete: "cascade" }),
    dependentTaskId: text("dependent_task_id")
      .notNull()
      .references(() => taskSpecification.id, { onDelete: "cascade" }),
    dependencyType: dependencyTypeEnum("dependency_type").notNull(),
    delayDays: integer("delay_days").default(0),
    condition: text("condition"), // Optional condition for dependency
    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    sourceIdx: index("task_dependency_source_idx").on(table.sourceTaskId),
    dependentIdx: index("task_dependency_dependent_idx").on(
      table.dependentTaskId,
    ),
    typeIdx: index("task_dependency_type_idx").on(table.dependencyType),
    activeIdx: index("task_dependency_active_idx").on(table.isActive),
  }),
);

/**
 * Task assignments to care plans and patients.
 * Links task specifications to specific care plan instances.
 */
export const taskAssignment = pgTable(
  "task_assignment",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    taskSpecificationId: text("task_specification_id")
      .notNull()
      .references(() => taskSpecification.id, { onDelete: "cascade" }),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    patientId: text("patient_id")
      .notNull()
      .references(() => patient.patId, { onDelete: "cascade" }),
    assignedTo: text("assigned_to")
      .notNull()
      .references(() => user.id),

    // Calculated dates based on task timing and care plan
    scheduledDate: timestamp("scheduled_date", {
      withTimezone: true,
      mode: "date",
    }),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "date" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),

    // Status and execution
    status: taskStatusEnum("status").notNull().default("pending"),
    executionContext: jsonb("execution_context"), // Patient/surgery context at assignment
    overrideInstructions: jsonb("override_instructions"), // Custom instructions for this assignment
    notes: text("notes"),

    // Assignment metadata
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    assignedBy: text("assigned_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    taskIdx: index("task_assignment_task_idx").on(table.taskSpecificationId),
    carePlanIdx: index("task_assignment_care_plan_idx").on(table.carePlanId),
    patientIdx: index("task_assignment_patient_idx").on(table.patientId),
    assignedToIdx: index("task_assignment_assigned_to_idx").on(
      table.assignedTo,
    ),
    statusIdx: index("task_assignment_status_idx").on(table.status),
    dueDateIdx: index("task_assignment_due_date_idx").on(table.dueDate),
    scheduledDateIdx: index("task_assignment_scheduled_idx").on(
      table.scheduledDate,
    ),
  }),
);

/**
 * Task execution tracking and status updates.
 * Records actual execution details and outcomes.
 */
export const taskExecution = pgTable(
  "task_execution",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    taskAssignmentId: text("task_assignment_id")
      .notNull()
      .references(() => taskAssignment.id, { onDelete: "cascade" }),

    // Execution details
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    actualDuration: integer("actual_duration_minutes"),

    // Execution results
    status: taskStatusEnum("status").notNull(),
    outcome: text("outcome"), // Success, partial, failed, etc.
    notes: text("notes"),
    complications: text("complications"),

    // Evidence and documentation
    documentation: jsonb("documentation"), // Photos, forms, measurements, etc.
    verificationRequired: boolean("verification_required").default(false),
    verifiedBy: text("verified_by").references(() => user.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),

    // Execution context
    executionContext: jsonb("execution_context"),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    executedBy: text("executed_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    assignmentIdx: index("task_execution_assignment_idx").on(
      table.taskAssignmentId,
    ),
    statusIdx: index("task_execution_status_idx").on(table.status),
    executedByIdx: index("task_execution_executed_by_idx").on(table.executedBy),
    startedAtIdx: index("task_execution_started_idx").on(table.startedAt),
    completedAtIdx: index("task_execution_completed_idx").on(table.completedAt),
    verificationIdx: index("task_execution_verification_idx").on(
      table.verificationRequired,
    ),
  }),
);

/**
 * Task validation results and error tracking.
 * Stores validation outcomes for task specifications.
 */
export const taskValidation = pgTable(
  "task_validation",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    taskSpecificationId: text("task_specification_id")
      .notNull()
      .references(() => taskSpecification.id, { onDelete: "cascade" }),

    // Validation results
    isValid: boolean("is_valid").notNull(),
    validationScore: real("validation_score").notNull(),
    errors: jsonb("errors").notNull(),
    warnings: jsonb("warnings").notNull(),

    // Detailed validation breakdown
    structureValid: boolean("structure_valid").notNull(),
    timingValid: boolean("timing_valid").notNull(),
    conditionsValid: boolean("conditions_valid").notNull(),
    evidenceValid: boolean("evidence_valid").notNull(),
    dependenciesValid: boolean("dependencies_valid").notNull(),

    // Validation metadata
    validationRules: jsonb("validation_rules"), // Rules used for validation
    validationContext: jsonb("validation_context"), // Context during validation

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    validatedBy: text("validated_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    taskIdx: index("task_validation_task_idx").on(table.taskSpecificationId),
    validIdx: index("task_validation_valid_idx").on(table.isValid),
    scoreIdx: index("task_validation_score_idx").on(table.validationScore),
    createdAtIdx: index("task_validation_created_idx").on(table.createdAt),
  }),
);

/**
 * Batch import tracking for JSON task specifications.
 * Tracks bulk imports of task definitions from JSON files.
 */
export const taskImportBatch = pgTable(
  "task_import_batch",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    batchDescription: text("batch_description"),

    // Import statistics
    totalTasks: integer("total_tasks").notNull(),
    importedCount: integer("imported_count").notNull().default(0),
    failedCount: integer("failed_count").notNull().default(0),
    skippedCount: integer("skipped_count").notNull().default(0),

    // Import configuration
    validateBeforeImport: boolean("validate_before_import")
      .notNull()
      .default(true),
    overwriteExisting: boolean("overwrite_existing").notNull().default(false),

    // Import status and results
    status: importStatusEnum("status").notNull().default("pending"),
    importResults: jsonb("import_results"), // Detailed results per task
    errorLog: jsonb("error_log"), // Import errors and warnings

    // Source information
    sourceFile: text("source_file"),
    sourceFormat: text("source_format").default("json"),

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Processing timestamps
    startedAt: timestamp("started_at", { withTimezone: true, mode: "date" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    importedBy: text("imported_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    statusIdx: index("task_import_batch_status_idx").on(table.status),
    orgIdx: index("task_import_batch_org_idx").on(table.organizationId),
    importedByIdx: index("task_import_batch_imported_by_idx").on(
      table.importedBy,
    ),
    createdAtIdx: index("task_import_batch_created_idx").on(table.createdAt),
  }),
);

/**
 * Comprehensive audit trail for all task management activities.
 */
export const taskAuditLog = pgTable(
  "task_audit_log",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Entity being audited
    entityType: text("entity_type").notNull(), // task_specification, task_assignment, etc.
    entityId: text("entity_id").notNull(),

    // Action details
    action: taskAuditActionEnum("action").notNull(),
    description: text("description"),

    // Change tracking
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    changes: jsonb("changes"), // Structured diff

    // Session and context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    sessionId: text("session_id"),

    // Additional metadata
    metadata: jsonb("metadata"),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    entityIdx: index("task_audit_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    actionIdx: index("task_audit_action_idx").on(table.action),
    userIdx: index("task_audit_user_idx").on(table.userId),
    createdAtIdx: index("task_audit_created_idx").on(table.createdAt),
  }),
);

// —————————————————————————————————————————————————————————————————————————————
// Relations for better query experience
// —————————————————————————————————————————————————————————————————————————————

export const taskSpecificationRelations = relations(
  taskSpecification,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [taskSpecification.organizationId],
      references: [organization.id],
    }),
    team: one(team, {
      fields: [taskSpecification.teamId],
      references: [team.id],
    }),
    createdByUser: one(user, {
      fields: [taskSpecification.createdBy],
      references: [user.id],
      relationName: "creator",
    }),
    updatedByUser: one(user, {
      fields: [taskSpecification.updatedBy],
      references: [user.id],
      relationName: "updater",
    }),
    versions: many(taskVersion),
    sourceDependencies: many(taskDependency, {
      relationName: "source",
    }),
    dependentTasks: many(taskDependency, {
      relationName: "dependent",
    }),
    assignments: many(taskAssignment),
    validations: many(taskValidation),
  }),
);

export const taskVersionRelations = relations(taskVersion, ({ one }) => ({
  taskSpecification: one(taskSpecification, {
    fields: [taskVersion.taskSpecificationId],
    references: [taskSpecification.id],
  }),
  createdByUser: one(user, {
    fields: [taskVersion.createdBy],
    references: [user.id],
  }),
}));

export const taskDependencyRelations = relations(taskDependency, ({ one }) => ({
  sourceTask: one(taskSpecification, {
    fields: [taskDependency.sourceTaskId],
    references: [taskSpecification.id],
    relationName: "source",
  }),
  dependentTask: one(taskSpecification, {
    fields: [taskDependency.dependentTaskId],
    references: [taskSpecification.id],
    relationName: "dependent",
  }),
  createdByUser: one(user, {
    fields: [taskDependency.createdBy],
    references: [user.id],
  }),
}));

export const taskAssignmentRelations = relations(
  taskAssignment,
  ({ one, many }) => ({
    taskSpecification: one(taskSpecification, {
      fields: [taskAssignment.taskSpecificationId],
      references: [taskSpecification.id],
    }),
    carePlan: one(carePlan, {
      fields: [taskAssignment.carePlanId],
      references: [carePlan.id],
    }),
    patient: one(patient, {
      fields: [taskAssignment.patientId],
      references: [patient.patId],
    }),
    assignedToUser: one(user, {
      fields: [taskAssignment.assignedTo],
      references: [user.id],
      relationName: "assignee",
    }),
    assignedByUser: one(user, {
      fields: [taskAssignment.assignedBy],
      references: [user.id],
      relationName: "assigner",
    }),
    executions: many(taskExecution),
  }),
);

export const taskExecutionRelations = relations(taskExecution, ({ one }) => ({
  taskAssignment: one(taskAssignment, {
    fields: [taskExecution.taskAssignmentId],
    references: [taskAssignment.id],
  }),
  executedByUser: one(user, {
    fields: [taskExecution.executedBy],
    references: [user.id],
    relationName: "executor",
  }),
  verifiedByUser: one(user, {
    fields: [taskExecution.verifiedBy],
    references: [user.id],
    relationName: "verifier",
  }),
}));

export const taskValidationRelations = relations(taskValidation, ({ one }) => ({
  taskSpecification: one(taskSpecification, {
    fields: [taskValidation.taskSpecificationId],
    references: [taskSpecification.id],
  }),
  validatedByUser: one(user, {
    fields: [taskValidation.validatedBy],
    references: [user.id],
  }),
}));

export const taskImportBatchRelations = relations(
  taskImportBatch,
  ({ one }) => ({
    organization: one(organization, {
      fields: [taskImportBatch.organizationId],
      references: [organization.id],
    }),
    importedByUser: one(user, {
      fields: [taskImportBatch.importedBy],
      references: [user.id],
    }),
  }),
);

export const taskAuditLogRelations = relations(taskAuditLog, ({ one }) => ({
  user: one(user, {
    fields: [taskAuditLog.userId],
    references: [user.id],
  }),
}));
