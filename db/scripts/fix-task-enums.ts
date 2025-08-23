#!/usr/bin/env bun

/**
 * Fix task management enum values to match frontend expectations
 */

import * as fs from "fs";
import * as path from "path";
import postgres from "postgres";

// Load environment variables
import { config } from "dotenv";

// Load .env.local from project root
config({ path: path.join(__dirname, "../../.env.local") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function main() {
  const client = postgres(DATABASE_URL, { max: 1 });

  try {
    console.log("Starting enum migration...");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "../migrations/0011_fix_task_enums.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        await client.unsafe(statement + ";");
      }
    }

    console.log("✅ Enum migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running migration:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
