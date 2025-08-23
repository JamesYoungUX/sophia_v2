CREATE TYPE "public"."evidence_quality" AS ENUM('A', 'B', 'C', 'D');--> statement-breakpoint
CREATE TYPE "public"."literature_source" AS ENUM('pubmed', 'cochrane', 'guidelines', 'systematic_review', 'clinical_trial');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('pending', 'under_review', 'approved', 'rejected', 'implemented');--> statement-breakpoint
CREATE TYPE "public"."recommendation_type" AS ENUM('update', 'add', 'remove', 'modify');--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('approve', 'reject', 'request_changes', 'defer');--> statement-breakpoint
CREATE TABLE "care_plan_access" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_level" text DEFAULT 'read' NOT NULL,
	"granted_by" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "genesis_audit_log" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"old_values" jsonb,
	"new_values" jsonb,
	"changes" jsonb,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genesis_care_plan_keywords" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"care_plan_id" text NOT NULL,
	"keyword" text NOT NULL,
	"category" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"search_weight" real DEFAULT 1 NOT NULL,
	"synonyms" jsonb,
	"exclusion_terms" jsonb,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genesis_clinical_reviews" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"recommendation_id" text NOT NULL,
	"reviewer_id" text NOT NULL,
	"decision" "review_decision" NOT NULL,
	"comments" text,
	"evidence_assessment" jsonb,
	"clinical_relevance" text,
	"implementation_feasibility" text,
	"risk_benefit_analysis" jsonb,
	"review_duration_minutes" integer,
	"additional_reviewers" jsonb,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "genesis_evidence_sources" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" text NOT NULL,
	"type" "literature_source" NOT NULL,
	"url" text,
	"api_endpoint" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"search_frequency" text DEFAULT 'daily' NOT NULL,
	"last_search_at" timestamp with time zone,
	"next_search_at" timestamp with time zone,
	"default_keywords" jsonb,
	"search_filters" jsonb,
	"rate_limit_config" jsonb,
	"total_articles_retrieved" integer DEFAULT 0,
	"relevant_articles_found" integer DEFAULT 0,
	"last_error" text,
	"error_count" integer DEFAULT 0,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genesis_literature_ingestion" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"source" "literature_source" NOT NULL,
	"source_id" text NOT NULL,
	"source_url" text,
	"title" text NOT NULL,
	"abstract" text,
	"authors" jsonb NOT NULL,
	"journal" text NOT NULL,
	"journal_details" jsonb,
	"publication_date" timestamp with time zone,
	"doi" text,
	"keywords" jsonb,
	"mesh_terms" jsonb,
	"publication_type" jsonb,
	"evidence_quality" "evidence_quality" NOT NULL,
	"evidence_quality_score" real NOT NULL,
	"evidence_quality_factors" jsonb,
	"relevance_score" real NOT NULL,
	"matched_care_plans" jsonb,
	"matched_tasks" jsonb,
	"processing_status" text DEFAULT 'processed' NOT NULL,
	"processing_errors" jsonb,
	"processing_notes" text,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genesis_recommendations" (
	"id" text PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"recommendation_type" "recommendation_type" NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"care_plan_id" text,
	"task_id" text,
	"rationale" text NOT NULL,
	"evidence_sources" jsonb NOT NULL,
	"evidence_summary" text,
	"implementation_steps" jsonb,
	"estimated_impact" jsonb,
	"resource_requirements" jsonb,
	"risk_assessment" jsonb,
	"status" "recommendation_status" DEFAULT 'pending' NOT NULL,
	"current_reviewer" text,
	"review_deadline" timestamp with time zone,
	"organization_id" text NOT NULL,
	"team_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"updated_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "care_plan" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "care_plan" ADD COLUMN "plan_level" text DEFAULT 'personal' NOT NULL;--> statement-breakpoint
ALTER TABLE "care_plan" ADD COLUMN "copied_from" text;--> statement-breakpoint
ALTER TABLE "care_plan" ADD COLUMN "original_plan_id" text;--> statement-breakpoint
ALTER TABLE "care_plan_access" ADD CONSTRAINT "care_plan_access_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_access" ADD CONSTRAINT "care_plan_access_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan_access" ADD CONSTRAINT "care_plan_access_granted_by_user_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_audit_log" ADD CONSTRAINT "genesis_audit_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_audit_log" ADD CONSTRAINT "genesis_audit_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_care_plan_keywords" ADD CONSTRAINT "genesis_care_plan_keywords_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_care_plan_keywords" ADD CONSTRAINT "genesis_care_plan_keywords_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_care_plan_keywords" ADD CONSTRAINT "genesis_care_plan_keywords_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_clinical_reviews" ADD CONSTRAINT "genesis_clinical_reviews_recommendation_id_genesis_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."genesis_recommendations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_clinical_reviews" ADD CONSTRAINT "genesis_clinical_reviews_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_evidence_sources" ADD CONSTRAINT "genesis_evidence_sources_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_evidence_sources" ADD CONSTRAINT "genesis_evidence_sources_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_literature_ingestion" ADD CONSTRAINT "genesis_literature_ingestion_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_literature_ingestion" ADD CONSTRAINT "genesis_literature_ingestion_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_care_plan_id_care_plan_id_fk" FOREIGN KEY ("care_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_task_id_task_specification_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."task_specification"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_current_reviewer_user_id_fk" FOREIGN KEY ("current_reviewer") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "genesis_recommendations" ADD CONSTRAINT "genesis_recommendations_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "care_plan_access_plan_user_idx" ON "care_plan_access" USING btree ("care_plan_id","user_id");--> statement-breakpoint
CREATE INDEX "care_plan_access_user_idx" ON "care_plan_access" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "care_plan_access_plan_idx" ON "care_plan_access" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "care_plan_access_level_idx" ON "care_plan_access" USING btree ("access_level");--> statement-breakpoint
CREATE INDEX "genesis_audit_entity_idx" ON "genesis_audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "genesis_audit_action_idx" ON "genesis_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "genesis_audit_org_idx" ON "genesis_audit_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "genesis_audit_user_idx" ON "genesis_audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "genesis_audit_created_idx" ON "genesis_audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "genesis_keywords_care_plan_idx" ON "genesis_care_plan_keywords" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "genesis_keywords_keyword_idx" ON "genesis_care_plan_keywords" USING btree ("keyword");--> statement-breakpoint
CREATE INDEX "genesis_keywords_category_idx" ON "genesis_care_plan_keywords" USING btree ("category");--> statement-breakpoint
CREATE INDEX "genesis_keywords_priority_idx" ON "genesis_care_plan_keywords" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "genesis_keywords_active_idx" ON "genesis_care_plan_keywords" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "genesis_keywords_org_idx" ON "genesis_care_plan_keywords" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "genesis_review_rec_idx" ON "genesis_clinical_reviews" USING btree ("recommendation_id");--> statement-breakpoint
CREATE INDEX "genesis_review_reviewer_idx" ON "genesis_clinical_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "genesis_review_decision_idx" ON "genesis_clinical_reviews" USING btree ("decision");--> statement-breakpoint
CREATE INDEX "genesis_review_created_idx" ON "genesis_clinical_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "genesis_evidence_name_idx" ON "genesis_evidence_sources" USING btree ("name");--> statement-breakpoint
CREATE INDEX "genesis_evidence_type_idx" ON "genesis_evidence_sources" USING btree ("type");--> statement-breakpoint
CREATE INDEX "genesis_evidence_active_idx" ON "genesis_evidence_sources" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "genesis_evidence_org_idx" ON "genesis_evidence_sources" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "genesis_evidence_last_search_idx" ON "genesis_evidence_sources" USING btree ("last_search_at");--> statement-breakpoint
CREATE INDEX "genesis_lit_source_idx" ON "genesis_literature_ingestion" USING btree ("source");--> statement-breakpoint
CREATE INDEX "genesis_lit_source_id_idx" ON "genesis_literature_ingestion" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "genesis_lit_title_idx" ON "genesis_literature_ingestion" USING btree ("title");--> statement-breakpoint
CREATE INDEX "genesis_lit_journal_idx" ON "genesis_literature_ingestion" USING btree ("journal");--> statement-breakpoint
CREATE INDEX "genesis_lit_evidence_quality_idx" ON "genesis_literature_ingestion" USING btree ("evidence_quality");--> statement-breakpoint
CREATE INDEX "genesis_lit_relevance_score_idx" ON "genesis_literature_ingestion" USING btree ("relevance_score");--> statement-breakpoint
CREATE INDEX "genesis_lit_org_idx" ON "genesis_literature_ingestion" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "genesis_lit_pub_date_idx" ON "genesis_literature_ingestion" USING btree ("publication_date");--> statement-breakpoint
CREATE INDEX "genesis_lit_processing_status_idx" ON "genesis_literature_ingestion" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "genesis_rec_title_idx" ON "genesis_recommendations" USING btree ("title");--> statement-breakpoint
CREATE INDEX "genesis_rec_type_idx" ON "genesis_recommendations" USING btree ("recommendation_type");--> statement-breakpoint
CREATE INDEX "genesis_rec_status_idx" ON "genesis_recommendations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "genesis_rec_priority_idx" ON "genesis_recommendations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "genesis_rec_care_plan_idx" ON "genesis_recommendations" USING btree ("care_plan_id");--> statement-breakpoint
CREATE INDEX "genesis_rec_task_idx" ON "genesis_recommendations" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "genesis_rec_org_idx" ON "genesis_recommendations" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "genesis_rec_team_idx" ON "genesis_recommendations" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "genesis_rec_reviewer_idx" ON "genesis_recommendations" USING btree ("current_reviewer");--> statement-breakpoint
CREATE INDEX "genesis_rec_deadline_idx" ON "genesis_recommendations" USING btree ("review_deadline");--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_copied_from_care_plan_id_fk" FOREIGN KEY ("copied_from") REFERENCES "public"."care_plan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "care_plan" ADD CONSTRAINT "care_plan_original_plan_id_care_plan_id_fk" FOREIGN KEY ("original_plan_id") REFERENCES "public"."care_plan"("id") ON DELETE set null ON UPDATE no action;