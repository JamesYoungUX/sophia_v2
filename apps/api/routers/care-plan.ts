import { Db } from "@repo/db";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc.js";

const DEBUG_LOG = true;

// Input validation schemas
const createCarePlanSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.any(), // JSONB content
  categoryId: z.string().optional(),
  isTemplate: z.boolean().default(false),
});

const updateCarePlanSchema = createCarePlanSchema.partial().extend({
  id: z.string(),
});

const searchCarePlansSchema = z.object({
  query: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const carePlanRouter = router({
  // Care Plan CRUD Operations
  create: protectedProcedure
    .input(createCarePlanSchema)
    .mutation(async ({ ctx, input }) => {
      if (DEBUG_LOG)
        console.log("Creating care plan:", {
          title: input.title,
          userId: ctx.user.id,
        });

      // TODO: Implement care plan creation logic
      return {
        id: "plan_" + Date.now(),
        title: input.title,
        description: input.description,
        content: input.content,
        categoryId: input.categoryId,
        isTemplate: input.isTemplate,
        createdBy: ctx.user.id,
        createdAt: new Date(),
      };
    }),

  update: protectedProcedure
    .input(updateCarePlanSchema)
    .mutation(async ({ input }) => {
      if (DEBUG_LOG) console.log("Updating care plan:", { id: input.id });

      // TODO: Implement care plan update logic
      return {
        ...input,
        updatedAt: new Date(),
      };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      if (DEBUG_LOG) console.log("Deleting care plan:", { id: input.id });

      // TODO: Implement care plan deletion logic
      return { success: true };
    }),

  list: protectedProcedure
    .input(searchCarePlansSchema)
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG) console.log("Listing care plans:", { filters: input });

      try {
        const { query, status, category, limit, offset } = input;

        // Build where conditions
        const whereConditions = [];

        // Filter by organization from session
        if (ctx.session?.activeOrganizationId) {
          whereConditions.push(
            eq(Db.carePlan.organizationId, ctx.session.activeOrganizationId),
          );
        } else {
          // If no active organization, return empty results
          if (DEBUG_LOG) console.log("No active organization in session");
          return {
            plans: [],
            totalCount: 0,
            hasMore: false,
          };
        }

        // Filter by search query
        if (query) {
          whereConditions.push(
            or(
              like(Db.carePlan.title, `%${query}%`),
              like(Db.carePlan.description || "", `%${query}%`),
            ),
          );
        }

        // Filter by status
        if (status && status !== "all") {
          whereConditions.push(eq(Db.carePlan.status, status as any));
        }

        // Filter by category (if we implement category filtering)
        if (category && category !== "all") {
          // TODO: Implement category filtering when we have category relationships
        }

        // Get total count
        const totalCount = await ctx.db
          .select({ count: Db.carePlan.id })
          .from(Db.carePlan)
          .where(and(...whereConditions));

        // Get care plans with pagination
        const plans = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            planLevel: Db.carePlan.planLevel,
            metadata: Db.carePlan.metadata,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
            organizationId: Db.carePlan.organizationId,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .orderBy(desc(Db.carePlan.updatedAt))
          .limit(limit)
          .offset(offset);

        // Get user names for createdBy/updatedBy
        const userIds = [
          ...new Set([
            ...plans.map((p) => p.createdBy).filter(Boolean),
            ...plans.map((p) => p.updatedBy).filter(Boolean),
          ]),
        ];

        const users =
          userIds.length > 0
            ? await ctx.db
                .select({
                  id: Db.user.id,
                  name: Db.user.name,
                })
                .from(Db.user)
                .where(inArray(Db.user.id, userIds))
            : [];

        const userMap = new Map(users.map((u) => [u.id, u.name]));

        // Transform plans to include user names and extract metadata
        const transformedPlans = plans.map((plan) => {
          const metadata = plan.metadata as any;
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            content: plan.content,
            planLevel: plan.planLevel,
            versionNumber: metadata?.versionNumber || 1,
            isTemplate: metadata?.isTemplate || false,
            tags: metadata?.tags || [],
            categoryId: metadata?.categoryId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            createdBy: userMap.get(plan.createdBy || "") || "Unknown",
            updatedBy: userMap.get(plan.updatedBy || "") || "Unknown",
            metadata: metadata,
          };
        });

        if (DEBUG_LOG) {
          console.log(`Found ${transformedPlans.length} care plans`);
          console.log("Sample plan content check:");
          if (transformedPlans.length > 0) {
            const samplePlan = transformedPlans[0];
            console.log(`  Plan: ${samplePlan.title}`);
            console.log(`  Has content: ${!!samplePlan.content}`);
            console.log(`  Content type: ${typeof samplePlan.content}`);
            if (samplePlan.content) {
              console.log(
                `  Content preview: ${JSON.stringify(samplePlan.content).substring(0, 100)}...`,
              );
            }
          }
        }

        return {
          plans: transformedPlans,
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        };
      } catch (error) {
        console.error("Error listing care plans:", error);
        throw new Error("Failed to fetch care plans");
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG) console.log("Getting care plan by ID:", { id: input.id });

      try {
        // Build where conditions for organization filtering
        const whereConditions = [eq(Db.carePlan.id, input.id)];

        // Filter by organization from session
        if (ctx.session?.activeOrganizationId) {
          whereConditions.push(
            eq(Db.carePlan.organizationId, ctx.session.activeOrganizationId),
          );
        } else {
          // If no active organization, return not found
          if (DEBUG_LOG) console.log("No active organization in session");
          throw new Error("Care plan not found");
        }

        const plan = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            metadata: Db.carePlan.metadata,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
            organizationId: Db.carePlan.organizationId,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .limit(1);

        if (!plan.length) {
          throw new Error("Care plan not found");
        }

        const carePlan = plan[0];
        const metadata = carePlan.metadata as any;

        // Get user names
        const userIds = [carePlan.createdBy, carePlan.updatedBy].filter(
          Boolean,
        );
        const users =
          userIds.length > 0
            ? await ctx.db
                .select({
                  id: Db.user.id,
                  name: Db.user.name,
                })
                .from(Db.user)
                .where(inArray(Db.user.id, userIds))
            : [];

        const userMap = new Map(users.map((u) => [u.id, u.name]));

        return {
          id: carePlan.id,
          title: carePlan.title,
          description: carePlan.description,
          status: carePlan.status,
          content: carePlan.content,
          versionNumber: metadata?.versionNumber || 1,
          isTemplate: metadata?.isTemplate || false,
          tags: metadata?.tags || [],
          categoryId: metadata?.categoryId,
          createdAt: carePlan.createdAt,
          updatedAt: carePlan.updatedAt,
          createdBy: userMap.get(carePlan.createdBy || "") || "Unknown",
          updatedBy: userMap.get(carePlan.updatedBy || "") || "Unknown",
          metadata: metadata,
        };
      } catch (error) {
        console.error("Error getting care plan:", error);
        throw new Error("Failed to fetch care plan");
      }
    }),

  // Category Management
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (DEBUG_LOG)
        console.log("Creating category:", {
          name: input.name,
          userId: ctx.user.id,
        });

      // TODO: Implement category creation logic
      return {
        id: "cat_" + Date.now(),
        name: input.name,
        description: input.description,
        parentId: input.parentId,
        createdBy: ctx.user.id,
        createdAt: new Date(),
      };
    }),

  listCategories: protectedProcedure.query(async () => {
    if (DEBUG_LOG) console.log("Listing categories");

    // TODO: Implement category listing logic
    return [];
  }),

  // New plan level procedures
  sophiaPlans: protectedProcedure
    .input(searchCarePlansSchema)
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG)
        console.log("Listing Sophia plans (system level):", { filters: input });

      try {
        const { query, status, category, limit, offset } = input;

        // Build where conditions for system plans
        const whereConditions = [eq(Db.carePlan.planLevel, "system")];

        // Filter by search query
        if (query) {
          whereConditions.push(
            or(
              like(Db.carePlan.title, `%${query}%`),
              like(Db.carePlan.description || "", `%${query}%`),
            ),
          );
        }

        // Filter by status
        if (status && status !== "all") {
          whereConditions.push(eq(Db.carePlan.status, status as any));
        }

        // Get total count
        const totalCount = await ctx.db
          .select({ count: Db.carePlan.id })
          .from(Db.carePlan)
          .where(and(...whereConditions));

        // Get care plans with pagination
        const plans = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            metadata: Db.carePlan.metadata,
            planLevel: Db.carePlan.planLevel,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .orderBy(desc(Db.carePlan.updatedAt))
          .limit(limit)
          .offset(offset);

        // Get user names for createdBy/updatedBy
        const userIds = [
          ...new Set([
            ...plans.map((p) => p.createdBy).filter(Boolean),
            ...plans.map((p) => p.updatedBy).filter(Boolean),
          ]),
        ];

        const users =
          userIds.length > 0
            ? await ctx.db
                .select({
                  id: Db.user.id,
                  name: Db.user.name,
                })
                .from(Db.user)
                .where(inArray(Db.user.id, userIds))
            : [];

        const userMap = new Map(users.map((u) => [u.id, u.name]));

        // Transform plans to include user names and extract metadata
        const transformedPlans = plans.map((plan) => {
          const metadata = plan.metadata as any;
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            content: plan.content,
            planLevel: plan.planLevel,
            versionNumber: metadata?.versionNumber || 1,
            isTemplate: metadata?.isTemplate || false,
            tags: metadata?.tags || [],
            categoryId: metadata?.categoryId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            createdBy: userMap.get(plan.createdBy || "") || "Unknown",
            updatedBy: userMap.get(plan.updatedBy || "") || "Unknown",
            metadata: metadata,
          };
        });

        if (DEBUG_LOG) {
          console.log(`Found ${transformedPlans.length} Sophia plans`);
        }

        return {
          plans: transformedPlans,
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        };
      } catch (error) {
        console.error("Error listing Sophia plans:", error);
        throw new Error("Failed to fetch Sophia plans");
      }
    }),

  organizationPlans: protectedProcedure
    .input(searchCarePlansSchema)
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG) {
        console.log("Listing organization plans:", { filters: input });
        console.log(
          "Session activeOrganizationId:",
          ctx.session?.activeOrganizationId,
        );
        console.log("User ID:", ctx.user.id);
      }

      try {
        const { query, status, category, limit, offset } = input;

        // Build where conditions for organization plans
        const whereConditions = [eq(Db.carePlan.planLevel, "organization")];

        // Only filter by organization if activeOrganizationId is set
        if (ctx.session?.activeOrganizationId) {
          whereConditions.push(
            eq(Db.carePlan.organizationId, ctx.session.activeOrganizationId),
          );
        } else {
          if (DEBUG_LOG) {
            console.log(
              "⚠️  No activeOrganizationId in session, returning empty results",
            );
          }
          return {
            plans: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false,
            },
          };
        }

        // Filter by search query
        if (query) {
          whereConditions.push(
            or(
              like(Db.carePlan.title, `%${query}%`),
              like(Db.carePlan.description || "", `%${query}%`),
            ),
          );
        }

        // Filter by status
        if (status && status !== "all") {
          whereConditions.push(eq(Db.carePlan.status, status as any));
        }

        // Get total count
        const totalCount = await ctx.db
          .select({ count: Db.carePlan.id })
          .from(Db.carePlan)
          .where(and(...whereConditions));

        // Get care plans with pagination
        const plans = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            metadata: Db.carePlan.metadata,
            planLevel: Db.carePlan.planLevel,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .orderBy(desc(Db.carePlan.updatedAt))
          .limit(limit)
          .offset(offset);

        // Get user names for createdBy/updatedBy
        const userIds = [
          ...new Set([
            ...plans.map((p) => p.createdBy).filter(Boolean),
            ...plans.map((p) => p.updatedBy).filter(Boolean),
          ]),
        ];

        const users =
          userIds.length > 0
            ? await ctx.db
                .select({
                  id: Db.user.id,
                  name: Db.user.name,
                })
                .from(Db.user)
                .where(inArray(Db.user.id, userIds))
            : [];

        const userMap = new Map(users.map((u) => [u.id, u.name]));

        // Transform plans to include user names and extract metadata
        const transformedPlans = plans.map((plan) => {
          const metadata = plan.metadata as any;
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            content: plan.content,
            planLevel: plan.planLevel,
            versionNumber: metadata?.versionNumber || 1,
            isTemplate: metadata?.isTemplate || false,
            tags: metadata?.tags || [],
            categoryId: metadata?.categoryId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            createdBy: userMap.get(plan.createdBy || "") || "Unknown",
            updatedBy: userMap.get(plan.updatedBy || "") || "Unknown",
            metadata: metadata,
          };
        });

        if (DEBUG_LOG) {
          console.log(`Found ${transformedPlans.length} organization plans`);
        }

        return {
          plans: transformedPlans,
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        };
      } catch (error) {
        console.error("Error listing organization plans:", error);
        throw new Error("Failed to fetch organization plans");
      }
    }),

  myPlans: protectedProcedure
    .input(searchCarePlansSchema)
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG) {
        console.log("Listing my plans:", { filters: input });
        console.log("User ID:", ctx.user.id);
        console.log(
          "Session activeOrganizationId:",
          ctx.session?.activeOrganizationId,
        );
      }

      try {
        const { query, status, category, limit, offset } = input;

        // Build where conditions for personal plans
        const whereConditions = [
          eq(Db.carePlan.planLevel, "personal"),
          eq(Db.carePlan.createdBy, ctx.user.id),
        ];

        // Filter by search query
        if (query) {
          whereConditions.push(
            or(
              like(Db.carePlan.title, `%${query}%`),
              like(Db.carePlan.description || "", `%${query}%`),
            ),
          );
        }

        // Filter by status
        if (status && status !== "all") {
          whereConditions.push(eq(Db.carePlan.status, status as any));
        }

        // Get total count
        const totalCount = await ctx.db
          .select({ count: Db.carePlan.id })
          .from(Db.carePlan)
          .where(and(...whereConditions));

        // Get care plans with pagination
        const plans = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            metadata: Db.carePlan.metadata,
            planLevel: Db.carePlan.planLevel,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .orderBy(desc(Db.carePlan.updatedAt))
          .limit(limit)
          .offset(offset);

        // Get user names for createdBy/updatedBy
        const userIds = [
          ...new Set([
            ...plans.map((p) => p.createdBy).filter(Boolean),
            ...plans.map((p) => p.updatedBy).filter(Boolean),
          ]),
        ];

        const users =
          userIds.length > 0
            ? await ctx.db
                .select({
                  id: Db.user.id,
                  name: Db.user.name,
                })
                .from(Db.user)
                .where(inArray(Db.user.id, userIds))
            : [];

        const userMap = new Map(users.map((u) => [u.id, u.name]));

        // Transform plans to include user names and extract metadata
        const transformedPlans = plans.map((plan) => {
          const metadata = plan.metadata as any;
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            content: plan.content,
            planLevel: plan.planLevel,
            versionNumber: metadata?.versionNumber || 1,
            isTemplate: metadata?.isTemplate || false,
            tags: metadata?.tags || [],
            categoryId: metadata?.categoryId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            createdBy: userMap.get(plan.createdBy || "") || "Unknown",
            updatedBy: userMap.get(plan.updatedBy || "") || "Unknown",
            metadata: metadata,
          };
        });

        if (DEBUG_LOG) {
          console.log(`Found ${transformedPlans.length} personal plans`);
        }

        return {
          plans: transformedPlans,
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        };
      } catch (error) {
        console.error("Error listing personal plans:", error);
        throw new Error("Failed to fetch personal plans");
      }
    }),

  teamPlans: protectedProcedure
    .input(searchCarePlansSchema)
    .query(async ({ ctx, input }) => {
      if (DEBUG_LOG) {
        console.log("Listing team plans:", { filters: input });
        console.log("User ID:", ctx.user.id);
        console.log(
          "Session activeOrganizationId:",
          ctx.session?.activeOrganizationId,
        );
      }

      try {
        const { limit, offset } = input;

        // Build where conditions for team plans
        const whereConditions = [eq(Db.carePlan.planLevel, "team")];

        // Only filter by organization if activeOrganizationId is set
        if (ctx.session?.activeOrganizationId) {
          whereConditions.push(
            eq(Db.carePlan.organizationId, ctx.session.activeOrganizationId),
          );
        } else {
          if (DEBUG_LOG) {
            console.log(
              "⚠️  No activeOrganizationId in session, returning empty results",
            );
          }
          return {
            plans: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false,
            },
          };
        }

        const plans = await ctx.db
          .select({
            id: Db.carePlan.id,
            title: Db.carePlan.title,
            description: Db.carePlan.description,
            status: Db.carePlan.status,
            content: Db.carePlan.content,
            metadata: Db.carePlan.metadata,
            createdAt: Db.carePlan.createdAt,
            updatedAt: Db.carePlan.updatedAt,
            createdBy: Db.carePlan.createdBy,
            updatedBy: Db.carePlan.updatedBy,
            organizationId: Db.carePlan.organizationId,
            planLevel: Db.carePlan.planLevel,
            versionNumber: Db.carePlan.versionNumber,
          })
          .from(Db.carePlan)
          .where(and(...whereConditions))
          .limit(limit)
          .offset(offset)
          .orderBy(desc(Db.carePlan.updatedAt));

        const totalCount = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(Db.carePlan)
          .where(and(...whereConditions));

        // Transform plans to match frontend expectations
        const transformedPlans = plans.map((plan) => {
          const metadata = plan.metadata as any;
          return {
            id: plan.id,
            title: plan.title,
            description: plan.description,
            status: plan.status,
            content: plan.content,
            versionNumber: plan.versionNumber,
            isTemplate: metadata?.isTemplate || false,
            tags: metadata?.tags || [],
            categoryId: metadata?.categoryId,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            createdBy: plan.createdBy,
            updatedBy: plan.updatedBy,
            organizationId: plan.organizationId,
            planLevel: plan.planLevel,
            metadata: metadata,
          };
        });

        return {
          plans: transformedPlans,
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        };
      } catch (error) {
        console.error("Error listing team plans:", error);
        throw new Error("Failed to fetch team plans");
      }
    }),
});
