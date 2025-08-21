#!/usr/bin/env bun

/**
 * Debug Seeder: Insert demo rows into public.care_exception for UI validation.
 * - Loads DATABASE_URL from .env.local or .env at repo root
 * - Ensures patient table has rows to reference
 * - Deletes previous demo rows (identified by note starting with "DEMO_SEED ")
 * - Inserts a small, varied dataset (escalated/non-escalated, statuses, severities)
 * - Prints a summary and sample output
 *
 * SAFE for local/dev use. Do NOT run against prod.
 */

import postgres from "postgres";
import { config } from "dotenv";
import { existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// Toggle verbose logs
const DEBUG_LOG = true;

function loadEnv() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const repoRoot = resolve(__dirname, "..");

  const envLocal = resolve(repoRoot, ".env.local");
  const envDefault = resolve(repoRoot, ".env");

  if (existsSync(envLocal)) {
    console.log("🔧 Loading env from:", envLocal);
    config({ path: envLocal });
  } else if (existsSync(envDefault)) {
    console.log("🔧 Loading env from:", envDefault);
    config({ path: envDefault });
  } else {
    console.log("ℹ️ No .env.local or .env found; relying on process env.");
  }
}

function randChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  try {
    loadEnv();

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("❌ DATABASE_URL not found in environment variables");
      process.exit(1);
    }

    if (DEBUG_LOG)
      console.log("📍 Using DATABASE_URL:", databaseUrl.replace(/\/\/[^@]+@/, "//***:***@"));

    const sql = postgres(databaseUrl, { prepare: true });

    // Guard: ensure target table exists
    const careExistsRows = await sql<{ exists: boolean }[]>/* sql */`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'care_exception'
      ) AS exists;
    `;
    const careExists = careExistsRows?.[0]?.exists === true;
    if (!careExists) {
      console.error("❌ Table public.care_exception does not exist. Run migrations first.");
      await sql.end({ timeout: 1 });
      process.exit(1);
    }

    // Get a few patient IDs to reference
    const patients = await sql<{ pat_id: string }[]>/* sql */`
      SELECT pat_id FROM patient ORDER BY created_at DESC NULLS LAST LIMIT 5;
    `;
    if (patients.length === 0) {
      console.error(
        "❌ No patients found. Seed patients first (e.g., bun db/scripts/seed.ts) and re-run."
      );
      await sql.end({ timeout: 1 });
      process.exit(1);
    }

    const patientIds: string[] = patients.map((p) => p.pat_id);
    if (DEBUG_LOG) console.log("🧪 Using patient IDs:", patientIds);

    // Clean previous demo seed rows to keep idempotent
    const delRes = await sql<{ id: string }[]>/* sql */`
      DELETE FROM care_exception WHERE note LIKE 'DEMO_SEED %' RETURNING id;
    `;
    const deleted = delRes.length;
    if (DEBUG_LOG) console.log("🧹 Removed prior demo rows:", deleted);

    const runId = new Date().toISOString();

    const severities = ["low", "medium", "high"] as const;
    const statuses = ["open", "acknowledged", "in_progress", "resolved", "dismissed"] as const;
    const types = [
      "bp_noncompliance",
      "missed_appointment",
      "medication_nonadherence",
      "postop_red_flag",
      "questionnaire_missed",
      "abnormal_lab_result",
    ] as const;
    const escalatedByType = ["agent", "human"] as const;
    const escalatedByAgent = [
      "compliance",
      "patient_engagement",
      "quantum",
      "genesis",
      "care_manager",
    ] as const;

    // Build a small, varied dataset (about 12-15 rows)
    type CareExceptionInsert = {
      patient_id: string;
      type: string;
      severity: "low" | "medium" | "high";
      status: "open" | "acknowledged" | "in_progress" | "resolved" | "dismissed";
      first_detected_at: Date | null;
      last_detected_at: Date | null;
      resolved_at: Date | null;
      escalated: boolean;
      escalated_at: Date | null;
      escalated_by_type: "agent" | "human" | null;
      escalated_by_agent: "compliance" | "patient_engagement" | "quantum" | "genesis" | "care_manager" | null;
      escalation_reason: string | null;
      note: string | null;
    };

    const rows: CareExceptionInsert[] = [];

    // Deterministic core cases for coverage
    for (const pid of patientIds) {
      const f1 = daysAgo(7);
      const l1 = daysAgo(5);
      rows.push({
        patient_id: pid,
        type: "bp_noncompliance",
        severity: "high",
        status: "open",
        first_detected_at: f1,
        last_detected_at: l1,
        resolved_at: null,
        escalated: true,
        escalated_at: daysAgo(5),
        escalated_by_type: "agent",
        escalated_by_agent: "compliance",
        escalation_reason: "Multiple days of elevated BP readings without response",
        note: `DEMO_SEED ${runId} | high/open escalated case`,
      });

      const f2 = daysAgo(10);
      const l2 = daysAgo(3);
      rows.push({
        patient_id: pid,
        type: "missed_appointment",
        severity: "medium",
        status: "in_progress",
        first_detected_at: f2,
        last_detected_at: l2,
        resolved_at: null,
        escalated: false,
        escalated_at: null,
        escalated_by_type: null,
        escalated_by_agent: null,
        escalation_reason: null,
        note: `DEMO_SEED ${runId} | medium/in_progress`,
      });

      const f3 = daysAgo(14);
      const l3 = daysAgo(12);
      rows.push({
        patient_id: pid,
        type: "medication_nonadherence",
        severity: "low",
        status: "resolved",
        first_detected_at: f3,
        last_detected_at: l3,
        resolved_at: daysAgo(11),
        escalated: false,
        escalated_at: null,
        escalated_by_type: null,
        escalated_by_agent: null,
        escalation_reason: null,
        note: `DEMO_SEED ${runId} | low/resolved`,
      });
    }

    // Add a few randomized extras to enrich variety
    for (let i = 0; i < 4; i++) {
      const pid = randChoice(patientIds);
      const sev = randChoice(severities);
      const st = randChoice(statuses);
      const t = randChoice(types);
      const fd = daysAgo(1 + Math.floor(Math.random() * 20));
      const ld = daysAgo(Math.max(0, 1 + Math.floor(Math.random() * 10)));
      const isEsc = Math.random() < 0.5;
      const ebt = isEsc ? randChoice(escalatedByType) : null;
      const eba = isEsc ? randChoice(escalatedByAgent) : null;

      rows.push({
        patient_id: pid,
        type: t,
        severity: sev,
        status: st,
        first_detected_at: fd,
        last_detected_at: ld,
        resolved_at: st === "resolved" ? daysAgo(Math.max(0, 1 + Math.floor(Math.random() * 5))) : null,
        escalated: isEsc,
        escalated_at: isEsc ? ld : null,
        escalated_by_type: ebt,
        escalated_by_agent: eba,
        escalation_reason: isEsc ? `Auto-escalated by ${eba ?? "system"} due to ${t}` : null,
        note: `DEMO_SEED ${runId} | random case`,
      });
    }

    if (DEBUG_LOG) console.log("🚚 Prepared rows:", rows.length);

    // Transaction for atomicity
    await sql.begin(async (trx) => {
      for (const r of rows) {
        await trx/* sql */`
          INSERT INTO care_exception (
            patient_id,
            type,
            severity,
            status,
            first_detected_at,
            last_detected_at,
            resolved_at,
            escalated,
            escalated_at,
            escalated_by_type,
            escalated_by_agent,
            escalation_reason,
            note
          ) VALUES (
            ${r.patient_id},
            ${r.type},
            ${r.severity},
            ${r.status},
            ${r.first_detected_at},
            ${r.last_detected_at},
            ${r.resolved_at},
            ${r.escalated},
            ${r.escalated_at},
            ${r.escalated_by_type},
            ${r.escalated_by_agent},
            ${r.escalation_reason},
            ${r.note}
          );
        `;
      }
    });

    // Summary
    const totalRows = await sql<{ count: number }[]>/* sql */`
      SELECT COUNT(*)::int AS count FROM care_exception;
    `;
    const total = totalRows?.[0]?.count ?? 0;

    const bySeverityRows = await sql<{ severity: string; count: number }[]>/* sql */`
      SELECT severity, COUNT(*)::int AS count FROM care_exception GROUP BY severity ORDER BY severity;
    `;

    const byStatusRows = await sql<{ status: string; count: number }[]>/* sql */`
      SELECT status, COUNT(*)::int AS count FROM care_exception GROUP BY status ORDER BY status;
    `;

    const demoCountRows = await sql<{ count: number }[]>/* sql */`
      SELECT COUNT(*)::int AS count FROM care_exception WHERE note LIKE 'DEMO_SEED %';
    `;
    const demoCount = demoCountRows?.[0]?.count ?? 0;

    console.log("\n✅ Seeding complete.");
    console.log("📊 care_exception total:", total);
    console.log("📊 demo rows inserted:", demoCount);
    console.log("📊 by severity:", bySeverityRows);
    console.log("📊 by status:", byStatusRows);

    const sample = await sql<{
      id: string;
      patient_id: string;
      type: string;
      severity: string;
      status: string;
      first_detected_at: Date | null;
      last_detected_at: Date | null;
      escalated: boolean;
    }[]>/* sql */`
      SELECT id, patient_id, type, severity, status, first_detected_at, last_detected_at, escalated
      FROM care_exception
      WHERE note LIKE 'DEMO_SEED %'
      ORDER BY created_at DESC
      LIMIT 3;
    `;
    console.log("🧾 Sample rows:", sample);

    await sql.end({ timeout: 1 });
  } catch (err) {
    const e = err as Error;
    console.error("❌ Seeding failed:", e.message);
    if (DEBUG_LOG) console.error("Full error:", e);
    process.exit(1);
  }
}

main();