/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { careException } from "@repo/db/schema/care-exception";
import { patient } from "@repo/db/schema/patient";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc.js";

// Temporary debug logging flag for this router; disable or remove after validation
const DEBUG_LOG = false;

// Enums enforced at API layer; DB stores as text for flexibility
const SeverityEnum = z.enum(["low", "medium", "high"]);
const StatusEnum = z.enum([
  "open",
  "acknowledged",
  "in_progress",
  "resolved",
  "dismissed",
]);
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
      const startedAt = Date.now();
      const {
        limit = 50,
        offset = 0,
        patientId,
        status,
        severity,
        escalatedOnly,
      } = input ?? {};

      if (DEBUG_LOG) {
        try {
          const envKeys = ctx?.env ? Object.keys(ctx.env) : [];
          const interestingEnv = envKeys.filter((k) =>
            ["HYPERDRIVE", "HYPERDRIVE_DIRECT", "DATABASE_URL"].some((p) =>
              k.includes(p),
            ),
          );
          const hasDb = !!ctx?.db;
          const hasSession = !!ctx?.session;
          const hasUser = !!ctx?.user;
          const infoPath = (ctx as any)?.info?.path ?? "unknown";
          console.log(
            "[DEBUG][careException.list] start",
            JSON.stringify({
              input: {
                patientId,
                status,
                severity,
                escalatedOnly,
                limit,
                offset,
              },
              ctx: {
                hasDb,
                hasSession,
                hasUser,
                infoPath,
                envKeys: interestingEnv,
              },
            }),
          );
        } catch (e) {
          console.log(
            "[DEBUG][careException.list] failed to log start context:",
            e,
          );
        }
      }

      const conditions = [] as any[];
      if (patientId) conditions.push(eq(careException.patientId, patientId));
      if (status) conditions.push(eq(careException.status, status));
      if (severity) conditions.push(eq(careException.severity, severity));
      if (escalatedOnly) conditions.push(eq(careException.escalated, true));

      // Build select with LEFT JOIN to patient, projecting required fields explicitly
      const base = ctx.db
        .select({
          id: careException.id,
          patientId: careException.patientId,
          type: careException.type,
          severity: careException.severity,
          status: careException.status,
          firstDetectedAt: careException.firstDetectedAt,
          lastDetectedAt: careException.lastDetectedAt,
          resolvedAt: careException.resolvedAt,
          escalated: careException.escalated,
          escalatedAt: careException.escalatedAt,
          escalatedByType: careException.escalatedByType,
          escalatedByAgent: careException.escalatedByAgent,
          escalationReason: careException.escalationReason,
          note: careException.note,
          createdAt: careException.createdAt,
          updatedAt: careException.updatedAt,
          // Joined patient fields
          patientLastName: patient.patLastName,
          patientFirstName: patient.patFirstName,
          patientMrnId: patient.patMrnId,
        })
        .from(careException)
        .leftJoin(patient, eq(patient.patId, careException.patientId));

      const rows = await (
        conditions.length ? base.where(and(...conditions)) : base
      )
        .limit(limit)
        .offset(offset);

      if (DEBUG_LOG) {
        try {
          const total = rows.length;
          let matched = 0;
          for (const r of rows) {
            // Consider a join "matched" if any of the joined fields are non-null
            if (
              r.patientFirstName != null ||
              r.patientLastName != null ||
              r.patientMrnId != null
            )
              matched++;
          }
          const orphans = total - matched;
          const sample = rows.slice(0, 5).map((r) => ({
            id: r.id,
            patientId: r.patientId,
            patient: {
              first: r.patientFirstName ?? null,
              last: r.patientLastName ?? null,
              mrn: r.patientMrnId ?? null,
            },
            type: r.type,
            severity: r.severity,
            status: r.status,
          }));
          const durationMs = Date.now() - startedAt;
          console.log(
            "[DEBUG][careException.list] results",
            JSON.stringify({
              total,
              matched,
              orphans,
              sampleCount: sample.length,
              durationMs,
              page: { limit, offset },
            }),
          );
          console.log(
            "[DEBUG][careException.list] sample rows:",
            JSON.stringify(sample),
          );
        } catch (e) {
          console.log("[DEBUG][careException.list] failed to log results:", e);
        }
      }

      return rows;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await ctx.db
        .select({
          id: careException.id,
          patientId: careException.patientId,
          type: careException.type,
          severity: careException.severity,
          status: careException.status,
          firstDetectedAt: careException.firstDetectedAt,
          lastDetectedAt: careException.lastDetectedAt,
          resolvedAt: careException.resolvedAt,
          escalated: careException.escalated,
          escalatedAt: careException.escalatedAt,
          escalatedByType: careException.escalatedByType,
          escalatedByAgent: careException.escalatedByAgent,
          escalationReason: careException.escalationReason,
          note: careException.note,
          createdAt: careException.createdAt,
          updatedAt: careException.updatedAt,
          // Joined patient fields
          patientLastName: patient.patLastName,
          patientFirstName: patient.patFirstName,
          patientMrnId: patient.patMrnId,
        })
        .from(careException)
        .leftJoin(patient, eq(patient.patId, careException.patientId))
        .where(eq(careException.id, input.id))
        .limit(1);
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
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const now = new Date();
      const escalated = Boolean(input.escalated);

      const severity = escalated ? "high" : (input.severity ?? "medium");
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
        escalatedAt: escalated ? (input.escalatedAt ?? now) : input.escalatedAt,
        escalatedByType: escalated
          ? (input.escalatedByType ?? "agent")
          : input.escalatedByType,
        escalatedByAgent: escalated
          ? (input.escalatedByAgent ?? "compliance")
          : input.escalatedByAgent,
        escalationReason: input.escalationReason,
        note: input.note,
      } satisfies Partial<typeof careException.$inferInsert> as any;

      const [row] = await ctx.db
        .insert(careException)
        .values(insertData)
        .returning();
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
      }),
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
      if (input.firstDetectedAt !== undefined)
        updateData.firstDetectedAt = input.firstDetectedAt;
      if (input.lastDetectedAt !== undefined)
        updateData.lastDetectedAt = input.lastDetectedAt;
      if (input.resolvedAt !== undefined)
        updateData.resolvedAt = input.resolvedAt;
      if (input.escalated !== undefined) updateData.escalated = input.escalated;
      if (input.escalatedAt !== undefined)
        updateData.escalatedAt =
          input.escalatedAt ?? (input.escalated ? now : null);
      if (input.escalatedByType !== undefined)
        updateData.escalatedByType = input.escalatedByType;
      if (input.escalatedByAgent !== undefined)
        updateData.escalatedByAgent = input.escalatedByAgent;
      if (input.escalationReason !== undefined)
        updateData.escalationReason = input.escalationReason;
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
if (DEBUG_LOG) {
  try {
    const keys = Object.keys((careExceptionRouter as any)?._def?.record ?? {});
    console.log("[DEBUG] careExceptionRouter init child keys:", keys);
  } catch (e) {
    console.log("[DEBUG] careExceptionRouter init: failed to read keys", e);
  }
}
