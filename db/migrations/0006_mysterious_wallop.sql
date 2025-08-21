CREATE TYPE "public"."audit_action" AS ENUM('create', 'read', 'update', 'delete', 'share', 'download', 'version_create', 'permission_change');--> statement-breakpoint
CREATE TYPE "public"."care_plan_status" AS ENUM('draft', 'active', 'archived', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('user', 'team', 'organization');--> statement-breakpoint
CREATE TYPE "public"."permission_level" AS ENUM('view', 'edit', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."dependency_type" AS ENUM('prerequisite', 'concurrent', 'sequential', 'conditional');--> statement-breakpoint
CREATE TYPE "public"."import_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."task_audit_action" AS ENUM('created', 'updated', 'deleted', 'activated', 'deactivated', 'validated', 'assigned', 'executed', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('Medication', 'Assessment', 'Education', 'Monitoring', 'Procedure', 'Documentation', 'Communication', 'Discharge', 'Follow-up', 'Other');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'deferred', 'failed');--> statement-breakpoint
CREATE TYPE "public"."task_version_status" AS ENUM('draft', 'active', 'inactive');--> statement-breakpoint
CREATE TABLE "care_plan" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb NOT NULL,
	"status" "care_plan_status" DEFAULT 'draft' NOT NULL,
	"category_id" text,
	"organization_id" text NOT NULL,
	"team_id" text,
	"current_version_id" text,
	"version_number" integer DEFAULT 1 NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"template_id" text,
	"search_vector" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_audit_log" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"action" "audit_action" NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_category" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"parent_id" text,
	"organization_id" text NOT NULL,
	"path" text NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_metadata" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"field_name" text NOT NULL,
	"field_value" jsonb NOT NULL,
	"field_type" text NOT NULL,
	"is_searchable" boolean DEFAULT true NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_permission" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" text NOT NULL,
	"permission_level" "permission_level" NOT NULL,
	"inherited_from" text,
	"is_inherited" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"granted_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_relationship" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"source_care_plan_id" text NOT NULL,
	"target_care_plan_id" text NOT NULL,
	"relationship_type" text NOT NULL,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_tag" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"tag" text NOT NULL,
	"category" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "care_plan_version" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb NOT NULL,
	"change_log" text,
	"changes_summary" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_assignment" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"task_specification_id" text NOT NULL,
	"care_plan_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"assigned_to" text NOT NULL,
	"scheduled_date" timestamp with time zone,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"execution_context" jsonb,
	"override_instructions" jsonb,
	"notes" text,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_audit_log" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" "task_audit_action" NOT NULL,
	"description" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"changes" jsonb,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_dependency" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"source_task_id" text NOT NULL,
	"dependent_task_id" text NOT NULL,
	"dependency_type" "dependency_type" NOT NULL,
	"delay_days" integer DEFAULT 0,
	"condition" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_execution" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"task_assignment_id" text NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"actual_duration_minutes" integer,
	"status" "task_status" NOT NULL,
	"outcome" text,
	"notes" text,
	"complications" text,
	"documentation" jsonb,
	"verification_required" boolean DEFAULT false,
	"verified_by" text,
	"verified_at" timestamp with time zone,
	"execution_context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"executed_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_import_batch" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"batch_description" text,
	"total_tasks" integer NOT NULL,
	"imported_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"validate_before_import" boolean DEFAULT true NOT NULL,
	"overwrite_existing" boolean DEFAULT false NOT NULL,
	"status" "import_status" DEFAULT 'pending' NOT NULL,
	"import_results" jsonb,
	"error_log" jsonb,
	"source_file" text,
	"source_format" text DEFAULT 'json',
	"organization_id" text NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"imported_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_specification" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"task_id" text NOT NULL,
	"name" text NOT NULL,
	"category" "task_category" NOT NULL,
	"instruction_patient" text NOT NULL,
	"instruction_clinician" text NOT NULL,
	"timing_offset_days" integer NOT NULL,
	"timing_duration_days" integer NOT NULL,
	"timing_time_of_day" text,
	"timing_is_flexible" boolean DEFAULT false,
	"conditions" jsonb NOT NULL,
	"evidence_source" text NOT NULL,
	"evidence_url" text NOT NULL,
	"evidence_level" text,
	"evidence_publication_date" text,
	"evidence_notes" text,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium',
	"version_status" "task_version_status" DEFAULT 'draft' NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_template" boolean DEFAULT true NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"validation_errors" jsonb,
	"validation_score" real DEFAULT 0,
	"organization_id" text NOT NULL,
	"team_id" text,
	"metadata" jsonb,
	"search_vector" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL,
	CONSTRAINT "task_specification_task_id_unique" UNIQUE("task_id")
);
--> statement-breakpoint
CREATE TABLE "task_validation" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"task_specification_id" text NOT NULL,
	"is_valid" boolean NOT NULL,
	"validation_score" real NOT NULL,
	"errors" jsonb NOT NULL,
	"warnings" jsonb NOT NULL,
	"structure_valid" boolean NOT NULL,
	"timing_valid" boolean NOT NULL,
	"conditions_valid" boolean NOT NULL,
	"evidence_valid" boolean NOT NULL,
	"dependencies_valid" boolean NOT NULL,
	"validation_rules" jsonb,
	"validation_context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"validated_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_version" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"task_specification_id" text NOT NULL,
	"version" text NOT NULL,
	"version_status" "task_version_status" DEFAULT 'draft' NOT NULL,
	"task_data" jsonb NOT NULL,
	"change_description" text,
	"changes_summary" jsonb,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_category_id_care_plan_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."care_plan_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_template_id_care_plan_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."care_plan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_audit_log" ADD CONSTRAINT "care_plan_audit_log_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_audit_log" ADD CONSTRAINT "care_plan_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_category" ADD CONSTRAINT "care_plan_category_parent_id_care_plan_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."care_plan_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_category" ADD CONSTRAINT "care_plan_category_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_category" ADD CONSTRAINT "care_plan_category_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_metadata" ADD CONSTRAINT "care_plan_metadata_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_metadata" ADD CONSTRAINT "care_plan_metadata_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_permission" ADD CONSTRAINT "care_plan_permission_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_permission" ADD CONSTRAINT "care_plan_permission_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_relationship" ADD CONSTRAINT "care_plan_relationship_source_care_plan_id_care_plan_id_fk" FOREIGN KEY ("source_care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_relationship" ADD CONSTRAINT "care_plan_relationship_target_care_plan_id_care_plan_id_fk" FOREIGN KEY ("target_care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_relationship" ADD CONSTRAINT "care_plan_relationship_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_tag" ADD CONSTRAINT "care_plan_tag_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_tag" ADD CONSTRAINT "care_plan_tag_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_version" ADD CONSTRAINT "care_plan_version_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_version" ADD CONSTRAINT "care_plan_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_specification_id_task_specification_id_fk" FOREIGN KEY ("task_specification_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_patient_id_patient_pat_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("pat_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_audit_log" ADD CONSTRAINT "task_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependency" ADD CONSTRAINT "task_dependency_source_task_id_task_specification_id_fk" FOREIGN KEY ("source_task_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependency" ADD CONSTRAINT "task_dependency_dependent_task_id_task_specification_id_fk" FOREIGN KEY ("dependent_task_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependency" ADD CONSTRAINT "task_dependency_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_task_assignment_id_task_assignment_id_fk" FOREIGN KEY ("task_assignment_id") REFERENCES "public"."task_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_execution" ADD CONSTRAINT "task_execution_executed_by_user_id_fk" FOREIGN KEY ("executed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_import_batch" ADD CONSTRAINT "task_import_batch_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_import_batch" ADD CONSTRAINT "task_import_batch_imported_by_user_id_fk" FOREIGN KEY ("imported_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_specification" ADD CONSTRAINT "task_specification_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_specification" ADD CONSTRAINT "task_specification_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_specification" ADD CONSTRAINT "task_specification_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_specification" ADD CONSTRAINT "task_specification_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_validation" ADD CONSTRAINT "task_validation_task_specification_id_task_specification_id_fk" FOREIGN KEY ("task_specification_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_validation" ADD CONSTRAINT "task_validation_validated_by_user_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_version" ADD CONSTRAINT "task_version_task_specification_id_task_specification_id_fk" FOREIGN KEY ("task_specification_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_version" ADD CONSTRAINT "task_version_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_plan_title_idx" ON "care_plan" USING btree ("title");--> statement-breakpoint
CREATE INDEX "care_plan_status_idx" ON "care_plan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "care_plan_category_idx" ON "care_plan" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "care_plan_org_idx" ON "care_plan" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "care_plan_team_idx" ON "care_plan" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "care_plan_template_idx" ON "care_plan" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "care_plan_search_idx" ON "care_plan" USING btree ("search_vector");--> statement-breakpoint
CREATE INDEX "care_plan_audit_plan_idx" ON "care_plan_audit_log" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "care_plan_audit_action_idx" ON "care_plan_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "care_plan_audit_user_idx" ON "care_plan_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "care_plan_audit_created_idx" ON "care_plan_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "care_plan_audit_entity_idx" ON "care_plan_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "care_plan_category_path_idx" ON "care_plan_category" USING btree ("path");--> statement-breakpoint
CREATE INDEX "care_plan_category_org_idx" ON "care_plan_category" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "care_plan_category_parent_idx" ON "care_plan_category" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "care_plan_metadata_plan_field_idx" ON "care_plan_metadata" USING btree ("care_plan_id","field_name");--> statement-breakpoint
CREATE INDEX "care_plan_metadata_field_idx" ON "care_plan_metadata" USING btree ("field_name");--> statement-breakpoint
CREATE INDEX "care_plan_metadata_searchable_idx" ON "care_plan_metadata" USING btree ("is_searchable");--> statement-breakpoint
CREATE INDEX "care_plan_permission_plan_entity_idx" ON "care_plan_permission" USING btree ("care_plan_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "care_plan_permission_entity_idx" ON "care_plan_permission" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "care_plan_relationship_source_idx" ON "care_plan_relationship" USING btree ("source_care_plan_id");--> statement-breakpoint
CREATE INDEX "care_plan_relationship_target_idx" ON "care_plan_relationship" USING btree ("target_care_plan_id");--> statement-breakpoint
CREATE INDEX "care_plan_relationship_type_idx" ON "care_plan_relationship" USING btree ("relationship_type");--> statement-breakpoint
CREATE INDEX "care_plan_tag_plan_idx" ON "care_plan_tag" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "care_plan_tag_tag_idx" ON "care_plan_tag" USING btree ("tag");--> statement-breakpoint
CREATE INDEX "care_plan_tag_category_idx" ON "care_plan_tag" USING btree ("category");--> statement-breakpoint
CREATE INDEX "care_plan_version_plan_idx" ON "care_plan_version" USING btree ("care_plan_id","version_number");--> statement-breakpoint
CREATE INDEX "care_plan_version_created_idx" ON "care_plan_version" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_assignment_task_idx" ON "task_assignment" USING btree ("task_specification_id");--> statement-breakpoint
CREATE INDEX "task_assignment_care_plan_idx" ON "task_assignment" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "task_assignment_patient_idx" ON "task_assignment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "task_assignment_assigned_to_idx" ON "task_assignment" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "task_assignment_status_idx" ON "task_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_assignment_due_date_idx" ON "task_assignment" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "task_assignment_scheduled_idx" ON "task_assignment" USING btree ("scheduled_date");--> statement-breakpoint
CREATE INDEX "task_audit_entity_idx" ON "task_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "task_audit_action_idx" ON "task_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "task_audit_user_idx" ON "task_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_audit_created_idx" ON "task_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_dependency_source_idx" ON "task_dependency" USING btree ("source_task_id");--> statement-breakpoint
CREATE INDEX "task_dependency_dependent_idx" ON "task_dependency" USING btree ("dependent_task_id");--> statement-breakpoint
CREATE INDEX "task_dependency_type_idx" ON "task_dependency" USING btree ("dependency_type");--> statement-breakpoint
CREATE INDEX "task_dependency_active_idx" ON "task_dependency" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_execution_assignment_idx" ON "task_execution" USING btree ("task_assignment_id");--> statement-breakpoint
CREATE INDEX "task_execution_status_idx" ON "task_execution" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_execution_executed_by_idx" ON "task_execution" USING btree ("executed_by");--> statement-breakpoint
CREATE INDEX "task_execution_started_idx" ON "task_execution" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "task_execution_completed_idx" ON "task_execution" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "task_execution_verification_idx" ON "task_execution" USING btree ("verification_required");--> statement-breakpoint
CREATE INDEX "task_import_batch_status_idx" ON "task_import_batch" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_import_batch_org_idx" ON "task_import_batch" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "task_import_batch_imported_by_idx" ON "task_import_batch" USING btree ("imported_by");--> statement-breakpoint
CREATE INDEX "task_import_batch_created_idx" ON "task_import_batch" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_spec_task_id_idx" ON "task_specification" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_spec_name_idx" ON "task_specification" USING btree ("name");--> statement-breakpoint
CREATE INDEX "task_spec_category_idx" ON "task_specification" USING btree ("category");--> statement-breakpoint
CREATE INDEX "task_spec_status_idx" ON "task_specification" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_spec_priority_idx" ON "task_specification" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "task_spec_version_status_idx" ON "task_specification" USING btree ("version_status");--> statement-breakpoint
CREATE INDEX "task_spec_org_idx" ON "task_specification" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "task_spec_team_idx" ON "task_specification" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "task_spec_active_idx" ON "task_specification" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_spec_valid_idx" ON "task_specification" USING btree ("is_valid");--> statement-breakpoint
CREATE INDEX "task_spec_search_idx" ON "task_specification" USING btree ("search_vector");--> statement-breakpoint
CREATE INDEX "task_spec_conditions_idx" ON "task_specification" USING gin ("conditions");--> statement-breakpoint
CREATE INDEX "task_validation_task_idx" ON "task_validation" USING btree ("task_specification_id");--> statement-breakpoint
CREATE INDEX "task_validation_valid_idx" ON "task_validation" USING btree ("is_valid");--> statement-breakpoint
CREATE INDEX "task_validation_score_idx" ON "task_validation" USING btree ("validation_score");--> statement-breakpoint
CREATE INDEX "task_validation_created_idx" ON "task_validation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_version_task_idx" ON "task_version" USING btree ("task_specification_id","version");--> statement-breakpoint
CREATE INDEX "task_version_version_status_idx" ON "task_version" USING btree ("version_status");--> statement-breakpoint
CREATE INDEX "task_version_active_idx" ON "task_version" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "task_version_created_idx" ON "task_version" USING btree ("created_at");