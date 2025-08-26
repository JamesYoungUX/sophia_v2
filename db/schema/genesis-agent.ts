/**
 * Database schema for Genesis Agent System.
 *
 * This schema provides comprehensive storage for literature ingestion,
 * evidence analysis, recommendation generation, and clinical review workflows.
 *
 * Tables defined:
 * - `genesisLiteratureIngestion`: Literature tracking and processing
 * - `genesisRecommendations`: Generated recommendations for care plans
 * - `genesisClinicalReviews`: Clinical review and approval workflow
 * - `genesisEvidenceSources`: Evidence source management
 * - `genesisCarePlanKeywords`: Keywords for literature matching
 * - `genesisAuditLog`: Comprehensive audit trail for all activities
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
import { taskSpecification } from "./task-management";
import { team } from "./team";
import { user } from "./user";

// Enums for type safety
export const evidenceQualityEnum = pgEnum("evidence_quality", [
  "A",
  "B",
  "C",
  "D",
]);

export const recommendationTypeEnum = pgEnum("recommendation_type", [
  "update",
  "add",
  "remove",
  "modify",
]);

export const recommendationStatusEnum = pgEnum("recommendation_status", [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "implemented",
]);

export const reviewDecisionEnum = pgEnum("review_decision", [
  "approve",
  "reject",
  "request_changes",
  "defer",
]);

export const literatureSourceEnum = pgEnum("literature_source", [
  "pubmed",
  "cochrane",
  "guidelines",
  "systematic_review",
  "clinical_trial",
]);

/**
 * Literature ingestion tracking and processing.
 * Stores all literature retrieved from various sources with processing metadata.
 */
export const genesisLiteratureIngestion = pgTable(
  "genesis_literature_ingestion",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Source information
    source: literatureSourceEnum("source").notNull(),
    sourceId: text("source_id").notNull(), // e.g., PMID for PubMed
    sourceUrl: text("source_url"),

    // Publication metadata
    title: text("title").notNull(),
    abstract: text("abstract"),
    authors: jsonb("authors").notNull(), // Array of author objects
    journal: text("journal").notNull(),
    journalDetails: jsonb("journal_details"), // Volume, issue, pages, etc.
    publicationDate: timestamp("publication_date", {
      withTimezone: true,
      mode: "date",
    }),
    doi: text("doi"),

    // Content analysis
    keywords: jsonb("keywords"), // Array of keywords
    meshTerms: jsonb("mesh_terms"), // Medical Subject Headings
    publicationType: jsonb("publication_type"), // Array of publication types

    // Evidence quality assessment
    evidenceQuality: evidenceQualityEnum("evidence_quality").notNull(),
    evidenceQualityScore: real("evidence_quality_score").notNull(), // 0-100
    evidenceQualityFactors: jsonb("evidence_quality_factors"), // Detailed assessment

    // Relevance and matching
    relevanceScore: real("relevance_score").notNull(), // 0-1
    matchedCarePlans: jsonb("matched_care_plans"), // Array of care plan IDs
    matchedTasks: jsonb("matched_tasks"), // Array of task IDs

    // Processing metadata
    processingStatus: text("processing_status").notNull().default("processed"), // processed, failed, pending
    processingErrors: jsonb("processing_errors"),
    processingNotes: text("processing_notes"),

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps and audit
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    processedAt: timestamp("processed_at", {
      withTimezone: true,
      mode: "date",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    sourceIdx: index("genesis_lit_source_idx").on(table.source),
    sourceIdIdx: index("genesis_lit_source_id_idx").on(table.sourceId),
    titleIdx: index("genesis_lit_title_idx").on(table.title),
    journalIdx: index("genesis_lit_journal_idx").on(table.journal),
    evidenceQualityIdx: index("genesis_lit_evidence_quality_idx").on(
      table.evidenceQuality,
    ),
    relevanceScoreIdx: index("genesis_lit_relevance_score_idx").on(
      table.relevanceScore,
    ),
    orgIdx: index("genesis_lit_org_idx").on(table.organizationId),
    publicationDateIdx: index("genesis_lit_pub_date_idx").on(
      table.publicationDate,
    ),
    processingStatusIdx: index("genesis_lit_processing_status_idx").on(
      table.processingStatus,
    ),
  }),
);

/**
 * Generated recommendations for care plan improvements.
 * Links literature evidence to specific care plan and task recommendations.
 */
export const genesisRecommendations = pgTable(
  "genesis_recommendations",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Recommendation metadata
    title: text("title").notNull(),
    description: text("description").notNull(),
    recommendationType: recommendationTypeEnum("recommendation_type").notNull(),
    priority: text("priority").notNull().default("medium"), // high, medium, low

    // Linked entities
    carePlanId: text("care_plan_id").references(() => carePlan.id, {
      onDelete: "cascade",
    }),
    taskId: text("task_id").references(() => taskSpecification.id, {
      onDelete: "cascade",
    }),

    // Evidence and rationale
    rationale: text("rationale").notNull(),
    evidenceSources: jsonb("evidence_sources").notNull(), // Array of literature IDs
    evidenceSummary: text("evidence_summary"),

    // Implementation details
    implementationSteps: jsonb("implementation_steps"), // Array of steps
    estimatedImpact: jsonb("estimated_impact"), // Predicted outcomes
    resourceRequirements: jsonb("resource_requirements"), // Time, cost, staff
    riskAssessment: jsonb("risk_assessment"), // Potential risks and mitigations

    // Status and workflow
    status: recommendationStatusEnum("status").notNull().default("pending"),
    currentReviewer: text("current_reviewer").references(() => user.id),
    reviewDeadline: timestamp("review_deadline", {
      withTimezone: true,
      mode: "date",
    }),

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    teamId: text("team_id").references(() => team.id, { onDelete: "set null" }),

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
    titleIdx: index("genesis_rec_title_idx").on(table.title),
    typeIdx: index("genesis_rec_type_idx").on(table.recommendationType),
    statusIdx: index("genesis_rec_status_idx").on(table.status),
    priorityIdx: index("genesis_rec_priority_idx").on(table.priority),
    carePlanIdx: index("genesis_rec_care_plan_idx").on(table.carePlanId),
    taskIdx: index("genesis_rec_task_idx").on(table.taskId),
    orgIdx: index("genesis_rec_org_idx").on(table.organizationId),
    teamIdx: index("genesis_rec_team_idx").on(table.teamId),
    reviewerIdx: index("genesis_rec_reviewer_idx").on(table.currentReviewer),
    deadlineIdx: index("genesis_rec_deadline_idx").on(table.reviewDeadline),
  }),
);

/**
 * Clinical review and approval workflow.
 * Tracks the review process for each recommendation.
 */
export const genesisClinicalReviews = pgTable(
  "genesis_clinical_reviews",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Linked recommendation
    recommendationId: text("recommendation_id")
      .notNull()
      .references(() => genesisRecommendations.id, { onDelete: "cascade" }),

    // Review details
    reviewerId: text("reviewer_id")
      .notNull()
      .references(() => user.id),
    decision: reviewDecisionEnum("decision").notNull(),
    comments: text("comments"),

    // Evidence assessment
    evidenceAssessment: jsonb("evidence_assessment"), // Detailed assessment
    clinicalRelevance: text("clinical_relevance"), // High, Medium, Low
    implementationFeasibility: text("implementation_feasibility"), // High, Medium, Low
    riskBenefitAnalysis: jsonb("risk_benefit_analysis"),

    // Review metadata
    reviewDuration: integer("review_duration_minutes"), // Time spent reviewing
    additionalReviewers: jsonb("additional_reviewers"), // Array of user IDs
    followUpRequired: boolean("follow_up_required").default(false),
    followUpNotes: text("follow_up_notes"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
  },
  (table) => ({
    recommendationIdx: index("genesis_review_rec_idx").on(
      table.recommendationId,
    ),
    reviewerIdx: index("genesis_review_reviewer_idx").on(table.reviewerId),
    decisionIdx: index("genesis_review_decision_idx").on(table.decision),
    createdAtIdx: index("genesis_review_created_idx").on(table.createdAt),
  }),
);

/**
 * Evidence source management and tracking.
 * Centralized management of evidence sources and their metadata.
 */
export const genesisEvidenceSources = pgTable(
  "genesis_evidence_sources",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Source information
    name: text("name").notNull(),
    type: literatureSourceEnum("type").notNull(),
    url: text("url"),
    apiEndpoint: text("api_endpoint"),

    // Configuration
    isActive: boolean("is_active").notNull().default(true),
    searchFrequency: text("search_frequency").notNull().default("daily"), // hourly, daily, weekly
    lastSearchAt: timestamp("last_search_at", {
      withTimezone: true,
      mode: "date",
    }),
    nextSearchAt: timestamp("next_search_at", {
      withTimezone: true,
      mode: "date",
    }),

    // Search configuration
    defaultKeywords: jsonb("default_keywords"), // Array of default search terms
    searchFilters: jsonb("search_filters"), // Publication type, date range, etc.
    rateLimitConfig: jsonb("rate_limit_config"), // API rate limiting settings

    // Performance metrics
    totalArticlesRetrieved: integer("total_articles_retrieved").default(0),
    relevantArticlesFound: integer("relevant_articles_found").default(0),
    lastError: text("last_error"),
    errorCount: integer("error_count").default(0),

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps
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
  },
  (table) => ({
    nameIdx: index("genesis_evidence_name_idx").on(table.name),
    typeIdx: index("genesis_evidence_type_idx").on(table.type),
    activeIdx: index("genesis_evidence_active_idx").on(table.isActive),
    orgIdx: index("genesis_evidence_org_idx").on(table.organizationId),
    lastSearchIdx: index("genesis_evidence_last_search_idx").on(
      table.lastSearchAt,
    ),
  }),
);

/**
 * Care plan keywords for literature matching.
 * Defines keywords and search terms for each care plan to enable literature matching.
 */
export const genesisCarePlanKeywords = pgTable(
  "genesis_care_plan_keywords",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Linked care plan
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),

    // Keyword configuration
    keyword: text("keyword").notNull(),
    category: text("category"), // diagnosis, treatment, medication, etc.
    priority: text("priority").notNull().default("medium"), // high, medium, low
    isActive: boolean("is_active").notNull().default(true),

    // Search configuration
    searchWeight: real("search_weight").notNull().default(1.0), // Multiplier for relevance scoring
    synonyms: jsonb("synonyms"), // Array of synonym terms
    exclusionTerms: jsonb("exclusion_terms"), // Terms to exclude from search

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps
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
  },
  (table) => ({
    carePlanIdx: index("genesis_keywords_care_plan_idx").on(table.carePlanId),
    keywordIdx: index("genesis_keywords_keyword_idx").on(table.keyword),
    categoryIdx: index("genesis_keywords_category_idx").on(table.category),
    priorityIdx: index("genesis_keywords_priority_idx").on(table.priority),
    activeIdx: index("genesis_keywords_active_idx").on(table.isActive),
    orgIdx: index("genesis_keywords_org_idx").on(table.organizationId),
  }),
);

/**
 * Comprehensive audit trail for all Genesis agent activities.
 */
/**
 * Monthly Genesis Findings aggregations.
 * Stores monthly findings summaries for the Genesis Agent dashboard.
 */
export const genesisMonthlyFindings = pgTable(
  "genesis_monthly_findings",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Time period
    year: integer("year").notNull(),
    month: integer("month").notNull(), // 1-12
    monthKey: text("month_key").notNull(), // YYYY-MM format

    // Care plan context
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    carePlanTitle: text("care_plan_title").notNull(),

    // Finding details
    findingId: text("finding_id").notNull(), // Unique identifier for this finding
    title: text("title").notNull(),
    source: text("source").notNull(),
    sourceType: text("source_type").notNull(), // research, systematic-review, guidelines, clinical-trial, ai-synthesis
    date: text("date").notNull(), // Publication/discovery date
    evidenceGrade: text("evidence_grade").notNull(), // A, B, C, D
    relevanceScore: real("relevance_score").notNull(), // 0-1
    summary: text("summary").notNull(),
    url: text("url"),
    
    // Status and workflow
    status: text("status").notNull(), // pending_cmo_review, cmo_approved, org_review, critical_review, implemented, rejected
    critical: boolean("critical").notNull().default(false),
    
    // CMO Review
    cmoReviewedAt: timestamp("cmo_reviewed_at", { withTimezone: true, mode: "date" }),
    cmoReviewerId: text("cmo_reviewer_id").references(() => user.id),
    cmoComments: text("cmo_comments"),
    cmoDecision: text("cmo_decision"), // approved, rejected, needs_more_info

    // Organization Review (after CMO approval)
    orgReviewedAt: timestamp("org_reviewed_at", { withTimezone: true, mode: "date" }),
    orgReviewerId: text("org_reviewer_id").references(() => user.id),
    orgComments: text("org_comments"),
    orgDecision: text("org_decision"), // approved, rejected, implemented

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    monthKeyIdx: index("genesis_findings_month_key_idx").on(table.monthKey),
    carePlanIdx: index("genesis_findings_care_plan_idx").on(table.carePlanId),
    statusIdx: index("genesis_findings_status_idx").on(table.status),
    criticalIdx: index("genesis_findings_critical_idx").on(table.critical),
    orgIdx: index("genesis_findings_org_idx").on(table.organizationId),
    yearMonthIdx: index("genesis_findings_year_month_idx").on(table.year, table.month),
    cmoReviewIdx: index("genesis_findings_cmo_review_idx").on(table.cmoReviewerId),
    orgReviewIdx: index("genesis_findings_org_review_idx").on(table.orgReviewerId),
  }),
);

/**
 * Genesis Agent care plan monitoring configuration.
 * Stores per-care-plan monitoring settings as requested by user.
 */
export const genesisCarePlanConfig = pgTable(
  "genesis_care_plan_config",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Care plan reference
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),

    // Monitoring configuration  
    updateFrequency: text("update_frequency").notNull().default("monthly"), // weekly, bi-weekly, monthly, quarterly
    monitoring: text("monitoring").notNull().default("active"), // active, paused
    lastChecked: timestamp("last_checked", { withTimezone: true, mode: "date" }),
    nextCheck: timestamp("next_check", { withTimezone: true, mode: "date" }),

    // Literature sources configuration
    pubmedEnabled: boolean("pubmed_enabled").notNull().default(true),
    cochraneEnabled: boolean("cochrane_enabled").notNull().default(true),
    guidelinesEnabled: boolean("guidelines_enabled").notNull().default(true),
    clinicalTrialsEnabled: boolean("clinical_trials_enabled").notNull().default(true),

    // Notification configuration
    notifyCmo: boolean("notify_cmo").notNull().default(true),
    notifyClinicalDirectors: boolean("notify_clinical_directors").notNull().default(false),
    notifyCarePlanOwners: boolean("notify_care_plan_owners").notNull().default(false),

    // Findings summary
    totalFindings: integer("total_findings").notNull().default(0),

    // Organization context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps
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
  },
  (table) => ({
    carePlanIdx: index("genesis_config_care_plan_idx").on(table.carePlanId),
    monitoringIdx: index("genesis_config_monitoring_idx").on(table.monitoring),
    frequencyIdx: index("genesis_config_frequency_idx").on(table.updateFrequency),
    orgIdx: index("genesis_config_org_idx").on(table.organizationId),
    nextCheckIdx: index("genesis_config_next_check_idx").on(table.nextCheck),
  }),
);

export const genesisAuditLog = pgTable(
  "genesis_audit_log",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),

    // Entity being audited
    entityType: text("entity_type").notNull(), // literature_ingestion, recommendation, review, etc.
    entityId: text("entity_id").notNull(),

    // Action details
    action: text("action").notNull(), // created, updated, reviewed, approved, etc.
    description: text("description"),

    // Change tracking
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    changes: jsonb("changes"), // Structured diff

    // Context
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    entityIdx: index("genesis_audit_entity_idx").on(
      table.entityType,
      table.entityId,
    ),
    actionIdx: index("genesis_audit_action_idx").on(table.action),
    orgIdx: index("genesis_audit_org_idx").on(table.organizationId),
    userIdx: index("genesis_audit_user_idx").on(table.userId),
    createdAtIdx: index("genesis_audit_created_idx").on(table.createdAt),
  }),
);

// —————————————————————————————————————————————————————————————————————————————
// Relations for better query experience
// —————————————————————————————————————————————————————————————————————————————

export const genesisLiteratureIngestionRelations = relations(
  genesisLiteratureIngestion,
  ({ one }) => ({
    organization: one(organization, {
      fields: [genesisLiteratureIngestion.organizationId],
      references: [organization.id],
    }),
    createdByUser: one(user, {
      fields: [genesisLiteratureIngestion.createdBy],
      references: [user.id],
    }),
  }),
);

export const genesisRecommendationsRelations = relations(
  genesisRecommendations,
  ({ one, many }) => ({
    carePlan: one(carePlan, {
      fields: [genesisRecommendations.carePlanId],
      references: [carePlan.id],
    }),
    task: one(taskSpecification, {
      fields: [genesisRecommendations.taskId],
      references: [taskSpecification.id],
    }),
    organization: one(organization, {
      fields: [genesisRecommendations.organizationId],
      references: [organization.id],
    }),
    team: one(team, {
      fields: [genesisRecommendations.teamId],
      references: [team.id],
    }),
    currentReviewer: one(user, {
      fields: [genesisRecommendations.currentReviewer],
      references: [user.id],
      relationName: "currentReviewer",
    }),
    createdByUser: one(user, {
      fields: [genesisRecommendations.createdBy],
      references: [user.id],
      relationName: "creator",
    }),
    updatedByUser: one(user, {
      fields: [genesisRecommendations.updatedBy],
      references: [user.id],
      relationName: "updater",
    }),
    reviews: many(genesisClinicalReviews),
  }),
);

export const genesisClinicalReviewsRelations = relations(
  genesisClinicalReviews,
  ({ one }) => ({
    recommendation: one(genesisRecommendations, {
      fields: [genesisClinicalReviews.recommendationId],
      references: [genesisRecommendations.id],
    }),
    reviewer: one(user, {
      fields: [genesisClinicalReviews.reviewerId],
      references: [user.id],
    }),
  }),
);

export const genesisEvidenceSourcesRelations = relations(
  genesisEvidenceSources,
  ({ one }) => ({
    organization: one(organization, {
      fields: [genesisEvidenceSources.organizationId],
      references: [organization.id],
    }),
    createdByUser: one(user, {
      fields: [genesisEvidenceSources.createdBy],
      references: [user.id],
    }),
  }),
);

export const genesisCarePlanKeywordsRelations = relations(
  genesisCarePlanKeywords,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [genesisCarePlanKeywords.carePlanId],
      references: [carePlan.id],
    }),
    organization: one(organization, {
      fields: [genesisCarePlanKeywords.organizationId],
      references: [organization.id],
    }),
    createdByUser: one(user, {
      fields: [genesisCarePlanKeywords.createdBy],
      references: [user.id],
    }),
  }),
);

export const genesisMonthlyFindingsRelations = relations(
  genesisMonthlyFindings,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [genesisMonthlyFindings.carePlanId],
      references: [carePlan.id],
    }),
    organization: one(organization, {
      fields: [genesisMonthlyFindings.organizationId],
      references: [organization.id],
    }),
    cmoReviewer: one(user, {
      fields: [genesisMonthlyFindings.cmoReviewerId],
      references: [user.id],
      relationName: "cmoReviewer",
    }),
    orgReviewer: one(user, {
      fields: [genesisMonthlyFindings.orgReviewerId],
      references: [user.id],
      relationName: "orgReviewer",
    }),
  }),
);

export const genesisCarePlanConfigRelations = relations(
  genesisCarePlanConfig,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [genesisCarePlanConfig.carePlanId],
      references: [carePlan.id],
    }),
    organization: one(organization, {
      fields: [genesisCarePlanConfig.organizationId],
      references: [organization.id],
    }),
    createdByUser: one(user, {
      fields: [genesisCarePlanConfig.createdBy],
      references: [user.id],
    }),
  }),
);

export const genesisAuditLogRelations = relations(
  genesisAuditLog,
  ({ one }) => ({
    organization: one(organization, {
      fields: [genesisAuditLog.organizationId],
      references: [organization.id],
    }),
    user: one(user, {
      fields: [genesisAuditLog.userId],
      references: [user.id],
    }),
  }),
);
