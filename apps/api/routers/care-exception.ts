/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { publicProcedure, router } from "../lib/trpc.js";
import { careException } from "@repo/db/schema/care-exception";

// Enums enforced at API layer; DB stores as text for flexibility
const SeverityEnum = z.enum(["low", "medium", "high"]);
const StatusEnum = z.enum(["open", "acknowledged", "in_progress", "resolved", "dismissed"]);
const EscalatedByTypeEnum = z.enum(["agent", "human"]);
const EscalatedByAgentEnum = z.enum([
  "compliance",
  "patient_engagement",
  "quantum",
  "genesis",
  "care_manager",
]);

export const careExceptionRouter = router({
  // Temporary ping endpoint to validate router path resolution; remove after debugging
  ping: publicProcedure.query(() => {
    const now = new Date().toISOString();
    // Minimal payload to confirm server reachability and router wiring
    return { ok: true, ts: now, router: "careException" };
  }),

  list: publicProcedure
    .input(
      z
        .object({
          patientId: z.string().optional(),
          status: StatusEnum.optional(),
          severity: SeverityEnum.optional(),
          escalatedOnly: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional()
        .default({ limit: 50, offset: 0 }),
    )
    .query(async ({ input, ctx }) => {
      const { limit = 50, offset = 0, patientId, status, severity, escalatedOnly } = input ?? {};

      const conditions = [] as any[];
      if (patientId) conditions.push(eq(careException.patientId, patientId));
      if (status) conditions.push(eq(careException.status, status));
      if (severity) conditions.push(eq(careException.severity, severity));
      if (escalatedOnly) conditions.push(eq(careException.escalated, true));

      const sel = ctx.db.select().from(careException);
      const rows = await (conditions.length ? sel.where(and(...conditions)) : sel)
        .limit(limit)
        .offset(offset);
      return rows;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.select().from(careException).where(eq(careException.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        patientId: z.string(),
        type: z.string().min(1),
        severity: SeverityEnum.optional(),
        status: StatusEnum.optional(),
        firstDetectedAt: z.date().optional(),
        lastDetectedAt: z.date().optional(),
        resolvedAt: z.date().optional(),
        escalated: z.boolean().optional(),
        escalatedAt: z.date().optional(),
        escalatedByType: EscalatedByTypeEnum.optional(),
        escalatedByAgent: EscalatedByAgentEnum.optional(),
        escalationReason: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const escalated = Boolean(input.escalated);

      const severity = escalated ? "high" : input.severity ?? "medium";
      const status = input.status ?? "open";

      const insertData = {
        patientId: input.patientId,
        type: input.type,
        severity,
        status,
        firstDetectedAt: input.firstDetectedAt ?? now,
        lastDetectedAt: input.lastDetectedAt ?? input.firstDetectedAt ?? now,
        resolvedAt: input.resolvedAt,
        escalated,
        escalatedAt: escalated ? input.escalatedAt ?? now : input.escalatedAt,
        escalatedByType: escalated ? input.escalatedByType ?? "agent" : input.escalatedByType,
        escalatedByAgent: escalated ? input.escalatedByAgent ?? "compliance" : input.escalatedByAgent,
        escalationReason: input.escalationReason,
        note: input.note,
      } satisfies Partial<typeof careException.$inferInsert> as any;

      const [row] = await ctx.db.insert(careException).values(insertData).returning();
      return row;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().min(1).optional(),
        severity: SeverityEnum.optional(),
        status: StatusEnum.optional(),
        firstDetectedAt: z.date().optional(),
        lastDetectedAt: z.date().optional(),
        resolvedAt: z.date().optional(),
        escalated: z.boolean().optional(),
        escalatedAt: z.date().optional(),
        escalatedByType: EscalatedByTypeEnum.optional(),
        escalatedByAgent: EscalatedByAgentEnum.optional(),
        escalationReason: z.string().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date();

      // Build update data while enforcing business rules
      let nextSeverity = input.severity;
      if (input.escalated === true) {
        nextSeverity = "high"; // enforce high on escalated
      }

      const updateData: Record<string, unknown> = {};
      if (input.type !== undefined) updateData.type = input.type;
      if (nextSeverity !== undefined) updateData.severity = nextSeverity;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.firstDetectedAt !== undefined) updateData.firstDetectedAt = input.firstDetectedAt;
      if (input.lastDetectedAt !== undefined) updateData.lastDetectedAt = input.lastDetectedAt;
      if (input.resolvedAt !== undefined) updateData.resolvedAt = input.resolvedAt;
      if (input.escalated !== undefined) updateData.escalated = input.escalated;
      if (input.escalatedAt !== undefined) updateData.escalatedAt = input.escalatedAt ?? (input.escalated ? now : null);
      if (input.escalatedByType !== undefined) updateData.escalatedByType = input.escalatedByType;
      if (input.escalatedByAgent !== undefined) updateData.escalatedByAgent = input.escalatedByAgent;
      if (input.escalationReason !== undefined) updateData.escalationReason = input.escalationReason;
      if (input.note !== undefined) updateData.note = input.note;

      // Auto-set resolvedAt if status is resolved and resolvedAt not provided
      if (input.status === "resolved" && updateData.resolvedAt === undefined) {
        updateData.resolvedAt = now;
      }

      const [row] = await ctx.db
        .update(careException)
        .set(updateData)
        .where(eq(careException.id, input.id))
        .returning();

      return row;
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.string(), status: StatusEnum }))
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const patch: Record<string, unknown> = { status: input.status };
      if (input.status === "resolved") {
        patch.resolvedAt = now;
      }
      const [row] = await ctx.db
        .update(careException)
        .set(patch)
        .where(eq(careException.id, input.id))
        .returning();
      return row;
    }),
});

// DEBUG: log router child keys on init
try {
  const keys = Object.keys((careExceptionRouter as any)?._def?.record ?? {});
  console.log("[DEBUG] careExceptionRouter init child keys:", keys);
} catch (e) {
  console.log("[DEBUG] careExceptionRouter init: failed to read keys", e);
}