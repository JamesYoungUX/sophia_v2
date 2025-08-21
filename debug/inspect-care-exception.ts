#!/usr/bin/env bun

/**
 * Read-only inspection script for the `care_exception` table.
 * - Loads DATABASE_URL from repo root .env.local (if available)
 * - Connects to Postgres and inspects the existence and structure of public.care_exception
 * - Prints columns, types, nullability, defaults, and constraints
 * - Additionally verifies FK to patient, computes orphan counts, and samples joined data
 *
 * This script DOES NOT modify any data.
 */

import postgres from 'postgres';
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const DEBUG_LOG = true;

function loadEnv() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const repoRootEnv = resolve(__dirname, '../.env.local');
  const localEnv = resolve(process.cwd(), '.env.local');

  let chosenPath: string | null = null;
  if (existsSync(repoRootEnv)) {
    chosenPath = repoRootEnv;
  } else if (existsSync(localEnv)) {
    chosenPath = localEnv;
  }

  if (chosenPath) {
    if (DEBUG_LOG) console.log(`🔧 Loading env from: ${chosenPath}`);
    config({ path: chosenPath });
  } else {
    if (DEBUG_LOG) console.log('⚠️ No local .env.local found; relying on process.env');
  }
}

async function main() {
  try {
    loadEnv();

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL not found in environment variables');
      process.exit(1);
    }

    if (DEBUG_LOG) console.log('📍 Using DATABASE_URL:', databaseUrl.replace(/\/\/[^@]+@/, '//***:***@'));

    const sql = postgres(databaseUrl, { prepare: true });

    // Print DB/session info to help with environment parity checks
    const dbInfoRows = await sql/* sql */`
      SELECT current_database() AS db, current_user AS usr, inet_server_addr()::text AS host, inet_server_port() AS port, now() AS ts;
    `;
    const dbInfo = dbInfoRows?.[0];
    console.log('--- DB Session Info ---');
    console.log(`db=${dbInfo?.db} user=${dbInfo?.usr} host=${dbInfo?.host}:${dbInfo?.port} ts=${dbInfo?.ts}`);

    if (DEBUG_LOG) console.log('🔍 Checking if table public.care_exception exists...');
    const tableCheck = await sql/* sql */`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'care_exception'
      ) AS exists;
    `;
    const exists = tableCheck?.[0]?.exists === true;

    if (!exists) {
      console.log('ℹ️ Table public.care_exception does NOT exist.');
      await sql.end({ timeout: 1 });
      process.exit(0);
    }

    console.log('✅ Table public.care_exception exists. Gathering details...');

    // Columns
    const columns = await sql/* sql */`
      SELECT
        c.ordinal_position,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = 'care_exception'
      ORDER BY c.ordinal_position;
    `;

    // Constraints (PK, FK, UNIQUE, CHECK)
    const constraints = await sql/* sql */`
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      LEFT JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'care_exception'
      ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position;
    `;

    // Indexes (including implicit)
    const indexes = await sql/* sql */`
      SELECT
        i.relname AS index_name,
        a.attname AS column_name,
        ix.indisunique AS is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relkind = 'r'
        AND t.relname = 'care_exception'
      ORDER BY i.relname;
    `;

    // Output results
    console.log('--- Columns ---');
    for (const col of columns) {
      console.log(
        `#${col.ordinal_position} ${col.column_name} ${col.data_type} ` +
          `(nullable=${col.is_nullable}) default=${col.column_default ?? 'NULL'}`,
      );
    }

    console.log('\n--- Constraints ---');
    for (const c of constraints) {
      console.log(
        `${c.constraint_type} ${c.constraint_name}` +
          (c.column_name ? ` on ${c.column_name}` : '') +
          (c.foreign_table_name ? ` -> ${c.foreign_table_name}(${c.foreign_column_name})` : ''),
      );
    }

    console.log('\n--- Indexes ---');
    for (const idx of indexes) {
      console.log(`${idx.index_name} on ${idx.column_name} unique=${idx.is_unique}`);
    }

    // Explicit FK verification to patient
    console.log('\n--- FK Verification (care_exception.patient_id -> patient.pat_id) ---');
    const fkRows = await sql/* sql */`
      SELECT
        tc.constraint_name,
        kcu.column_name AS ce_column,
        ccu.table_name AS ref_table,
        ccu.column_name AS ref_column
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'care_exception'
        AND ccu.table_name = 'patient'
        AND ccu.column_name = 'pat_id'
        AND kcu.column_name = 'patient_id';
    `;
    if (fkRows.length === 0) {
      console.log('❗ No FK found linking care_exception.patient_id to patient.pat_id');
    } else {
      for (const r of fkRows) {
        console.log(`FK ${r.constraint_name}: care_exception.${r.ce_column} -> ${r.ref_table}.${r.ref_column}`);
      }
    }

    // Orphan and match counts
    console.log('\n--- Join Health (care_exception LEFT JOIN patient) ---');
    const counts = await sql/* sql */`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN p.pat_id IS NULL THEN 1 ELSE 0 END) AS orphans,
        SUM(CASE WHEN p.pat_id IS NOT NULL THEN 1 ELSE 0 END) AS matched
      FROM care_exception ce
      LEFT JOIN patient p ON p.pat_id = ce.patient_id;
    `;
    const cnt = counts?.[0];
    console.log(`total=${cnt?.total} matched=${cnt?.matched} orphans=${cnt?.orphans}`);

    // Sample orphan patient_ids (up to 10)
    const orphanSamples = await sql/* sql */`
      SELECT ce.patient_id, COUNT(*) AS n
      FROM care_exception ce
      LEFT JOIN patient p ON p.pat_id = ce.patient_id
      WHERE p.pat_id IS NULL
      GROUP BY ce.patient_id
      ORDER BY n DESC
      LIMIT 10;
    `;
    if (orphanSamples.length === 0) {
      console.log('No orphan care_exception rows detected.');
    } else {
      console.log('Orphan samples (patient_id => count):');
      for (const r of orphanSamples) {
        console.log(`- ${r.patient_id} => ${r.n}`);
      }
    }

    // Sample matched joined rows to confirm patient fields are populated
    const joinedSamples = await sql/* sql */`
      SELECT ce.id, ce.patient_id, p.pat_first_name, p.pat_last_name, p.pat_mrn_id
      FROM care_exception ce
      JOIN patient p ON p.pat_id = ce.patient_id
      ORDER BY ce.created_at DESC NULLS LAST
      LIMIT 10;
    `;
    console.log('\nJoined samples (latest 10):');
    for (const r of joinedSamples) {
      console.log(`ce.id=${r.id} pid=${r.patient_id} name=${r.pat_last_name || ''}, ${r.pat_first_name || ''} mrn=${r.pat_mrn_id || ''}`);
    }

    await sql.end({ timeout: 1 });
    console.log('\n🎉 Inspection complete.');
  } catch (err) {
    const e = err as Error;
    console.error('❌ Inspection failed:', e.message);
    if (DEBUG_LOG) console.error('Full error:', e);
    process.exit(1);
  }
}

main();