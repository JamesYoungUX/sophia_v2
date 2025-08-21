/**
 * Database schema for Care Plan Repository System.
 *
 * This schema provides a comprehensive repository for storing and organizing
 * care plans with hierarchical categorization, version control, role-based
 * access control, advanced search, metadata management, and audit trails.
 *
 * Tables defined:
 * - `carePlanCategory`: Hierarchical folder structure for organizing plans
 * - `carePlan`: Core care plan documents with metadata
 * - `carePlanVersion`: Version control with complete revision history
 * - `carePlanPermission`: Granular access control permissions
 * - `carePlanTag`: Flexible tagging system for categorization
 * - `carePlanMetadata`: Custom metadata fields and values
 * - `carePlanRelationship`: Relationships between care plans
 * - `carePlanAuditLog`: Comprehensive audit trail for all activities
 * - `carePlanSearch`: Full-text search index for advanced search
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
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { team } from "./team";
import { user } from "./user";

// Enums for type safety
export const carePlanStatusEnum = pgEnum("care_plan_status", [
  "draft",
  "active",
  "archived",
  "deprecated",
]);

export const permissionLevelEnum = pgEnum("permission_level", [
  "view",
  "edit",
  "admin",
  "owner",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "read",
  "update",
  "delete",
  "share",
  "download",
  "version_create",
  "permission_change",
]);

export const entityTypeEnum = pgEnum("entity_type", [
  "user",
  "team",
  "organization",
]);

/**
 * Hierarchical category structure for organizing care plans.
 * Supports nested folders and subcategories with unlimited depth.
 */
export const carePlanCategory: any = pgTable(
  "care_plan_category",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    name: text("name").notNull(),
    description: text("description"),
    parentId: text("parent_id").references((): any => carePlanCategory.id, {
      onDelete: "cascade",
    }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    path: text("path").notNull(), // Materialized path for efficient queries
    level: integer("level").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    metadata: jsonb("metadata"),
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
    pathIdx: index("care_plan_category_path_idx").on(table.path),
    orgIdx: index("care_plan_category_org_idx").on(table.organizationId),
    parentIdx: index("care_plan_category_parent_idx").on(table.parentId),
  })
);

/**
 * Core care plan documents with comprehensive metadata.
 */
export const carePlan: any = pgTable(
  "care_plan",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    title: text("title").notNull(),
    description: text("description"),
    content: jsonb("content").notNull(), // Structured care plan content
    status: carePlanStatusEnum("status").notNull().default("draft"),
    categoryId: text("category_id").references(() => carePlanCategory.id, {
      onDelete: "set null",
    }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    teamId: text("team_id").references(() => team.id, {
      onDelete: "set null",
    }),
    currentVersionId: text("current_version_id"), // References latest version
    versionNumber: integer("version_number").notNull().default(1),
    isTemplate: boolean("is_template").notNull().default(false),
    templateId: text("template_id").references((): any => carePlan.id, {
      onDelete: "set null",
    }),
    searchVector: text("search_vector"), // Full-text search vector
    metadata: jsonb("metadata"),
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
    titleIdx: index("care_plan_title_idx").on(table.title),
    statusIdx: index("care_plan_status_idx").on(table.status),
    categoryIdx: index("care_plan_category_idx").on(table.categoryId),
    orgIdx: index("care_plan_org_idx").on(table.organizationId),
    teamIdx: index("care_plan_team_idx").on(table.teamId),
    templateIdx: index("care_plan_template_idx").on(table.templateId),
    searchIdx: index("care_plan_search_idx").on(table.searchVector),
  })
);

/**
 * Version control system maintaining complete revision history.
 */
export const carePlanVersion = pgTable(
  "care_plan_version",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    content: jsonb("content").notNull(),
    changeLog: text("change_log"),
    changesSummary: jsonb("changes_summary"), // Structured diff summary
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    planVersionIdx: index("care_plan_version_plan_idx").on(
      table.carePlanId,
      table.versionNumber
    ),
    createdAtIdx: index("care_plan_version_created_idx").on(table.createdAt),
  })
);

/**
 * Granular permission system with inheritance support.
 */
export const carePlanPermission = pgTable(
  "care_plan_permission",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(), // user.id, team.id, or organization.id
    permissionLevel: permissionLevelEnum("permission_level").notNull(),
    inheritedFrom: text("inherited_from"), // For permission inheritance tracking
    isInherited: boolean("is_inherited").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    grantedBy: text("granted_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    planEntityIdx: index("care_plan_permission_plan_entity_idx").on(
      table.carePlanId,
      table.entityType,
      table.entityId
    ),
    entityIdx: index("care_plan_permission_entity_idx").on(
      table.entityType,
      table.entityId
    ),
  })
);

/**
 * Flexible tagging system for categorization and search.
 */
export const carePlanTag = pgTable(
  "care_plan_tag",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
    category: text("category"), // Optional tag categorization
    color: text("color"), // UI color for tag display
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    planTagIdx: index("care_plan_tag_plan_idx").on(table.carePlanId),
    tagIdx: index("care_plan_tag_tag_idx").on(table.tag),
    categoryIdx: index("care_plan_tag_category_idx").on(table.category),
  })
);

/**
 * Custom metadata fields and values for flexible data storage.
 */
export const carePlanMetadata = pgTable(
  "care_plan_metadata",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    fieldName: text("field_name").notNull(),
    fieldValue: jsonb("field_value").notNull(),
    fieldType: text("field_type").notNull(), // string, number, date, boolean, array, object
    isSearchable: boolean("is_searchable").notNull().default(true),
    isRequired: boolean("is_required").notNull().default(false),
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
    planFieldIdx: index("care_plan_metadata_plan_field_idx").on(
      table.carePlanId,
      table.fieldName
    ),
    fieldNameIdx: index("care_plan_metadata_field_idx").on(table.fieldName),
    searchableIdx: index("care_plan_metadata_searchable_idx").on(
      table.isSearchable
    ),
  })
);

/**
 * Relationship mapping between care plans.
 */
export const carePlanRelationship = pgTable(
  "care_plan_relationship",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    sourceCarePlanId: text("source_care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    targetCarePlanId: text("target_care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    relationshipType: text("relationship_type").notNull(), // depends_on, extends, replaces, related_to
    description: text("description"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    sourceIdx: index("care_plan_relationship_source_idx").on(
      table.sourceCarePlanId
    ),
    targetIdx: index("care_plan_relationship_target_idx").on(
      table.targetCarePlanId
    ),
    typeIdx: index("care_plan_relationship_type_idx").on(
      table.relationshipType
    ),
  })
);

/**
 * Comprehensive audit trail for all care plan activities.
 */
export const carePlanAuditLog = pgTable(
  "care_plan_audit_log",
  {
    id: text("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    carePlanId: text("care_plan_id")
      .notNull()
      .references(() => carePlan.id, { onDelete: "cascade" }),
    action: auditActionEnum("action").notNull(),
    entityType: text("entity_type"), // What was affected
    entityId: text("entity_id"), // ID of affected entity
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    changes: jsonb("changes"), // Structured diff
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    sessionId: text("session_id"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    planIdx: index("care_plan_audit_plan_idx").on(table.carePlanId),
    actionIdx: index("care_plan_audit_action_idx").on(table.action),
    userIdx: index("care_plan_audit_user_idx").on(table.userId),
    createdAtIdx: index("care_plan_audit_created_idx").on(table.createdAt),
    entityIdx: index("care_plan_audit_entity_idx").on(
      table.entityType,
      table.entityId
    ),
  })
);

// —————————————————————————————————————————————————————————————————————————————
// Relations for better query experience
// —————————————————————————————————————————————————————————————————————————————

export const carePlanCategoryRelations = relations(
  carePlanCategory,
  ({ one, many }) => ({
    parent: one(carePlanCategory, {
      fields: [carePlanCategory.parentId],
      references: [carePlanCategory.id],
      relationName: "parent",
    }),
    children: many(carePlanCategory, {
      relationName: "parent",
    }),
    organization: one(organization, {
      fields: [carePlanCategory.organizationId],
      references: [organization.id],
    }),
    createdByUser: one(user, {
      fields: [carePlanCategory.createdBy],
      references: [user.id],
    }),
    carePlans: many(carePlan),
  })
);

export const carePlanRelations = relations(carePlan, ({ one, many }) => ({
  category: one(carePlanCategory, {
    fields: [carePlan.categoryId],
    references: [carePlanCategory.id],
  }),
  organization: one(organization, {
    fields: [carePlan.organizationId],
    references: [organization.id],
  }),
  team: one(team, {
    fields: [carePlan.teamId],
    references: [team.id],
  }),
  template: one(carePlan, {
    fields: [carePlan.templateId],
    references: [carePlan.id],
    relationName: "template",
  }),
  derivedPlans: many(carePlan, {
    relationName: "template",
  }),
  currentVersion: one(carePlanVersion, {
    fields: [carePlan.currentVersionId],
    references: [carePlanVersion.id],
  }),
  createdByUser: one(user, {
    fields: [carePlan.createdBy],
    references: [user.id],
    relationName: "creator",
  }),
  updatedByUser: one(user, {
    fields: [carePlan.updatedBy],
    references: [user.id],
    relationName: "updater",
  }),
  versions: many(carePlanVersion),
  permissions: many(carePlanPermission),
  tags: many(carePlanTag),
  metadata: many(carePlanMetadata),
  sourceRelationships: many(carePlanRelationship, {
    relationName: "source",
  }),
  targetRelationships: many(carePlanRelationship, {
    relationName: "target",
  }),
  auditLogs: many(carePlanAuditLog),
}));

export const carePlanVersionRelations = relations(
  carePlanVersion,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [carePlanVersion.carePlanId],
      references: [carePlan.id],
    }),
    createdByUser: one(user, {
      fields: [carePlanVersion.createdBy],
      references: [user.id],
    }),
  })
);

export const carePlanPermissionRelations = relations(
  carePlanPermission,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [carePlanPermission.carePlanId],
      references: [carePlan.id],
    }),
    grantedByUser: one(user, {
      fields: [carePlanPermission.grantedBy],
      references: [user.id],
    }),
  })
);

export const carePlanTagRelations = relations(carePlanTag, ({ one }) => ({
  carePlan: one(carePlan, {
    fields: [carePlanTag.carePlanId],
    references: [carePlan.id],
  }),
  createdByUser: one(user, {
    fields: [carePlanTag.createdBy],
    references: [user.id],
  }),
}));

export const carePlanMetadataRelations = relations(
  carePlanMetadata,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [carePlanMetadata.carePlanId],
      references: [carePlan.id],
    }),
    createdByUser: one(user, {
      fields: [carePlanMetadata.createdBy],
      references: [user.id],
    }),
  })
);

export const carePlanRelationshipRelations = relations(
  carePlanRelationship,
  ({ one }) => ({
    sourceCarePlan: one(carePlan, {
      fields: [carePlanRelationship.sourceCarePlanId],
      references: [carePlan.id],
      relationName: "source",
    }),
    targetCarePlan: one(carePlan, {
      fields: [carePlanRelationship.targetCarePlanId],
      references: [carePlan.id],
      relationName: "target",
    }),
    createdByUser: one(user, {
      fields: [carePlanRelationship.createdBy],
      references: [user.id],
    }),
  })
);

export const carePlanAuditLogRelations = relations(
  carePlanAuditLog,
  ({ one }) => ({
    carePlan: one(carePlan, {
      fields: [carePlanAuditLog.carePlanId],
      references: [carePlan.id],
    }),
    user: one(user, {
      fields: [carePlanAuditLog.userId],
      references: [user.id],
    }),
  })
);