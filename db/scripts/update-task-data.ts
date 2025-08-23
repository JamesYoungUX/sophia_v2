#!/usr/bin/env bun

/**
 * Update existing task data to match new enum values
 */

import { config } from "dotenv";
import * as path from "path";
import postgres from "postgres";

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
    console.log("Updating task data to match new enum values...");

    // Update any priority values from 'critical' to 'high' (since we can't change enum easily)
    console.log("Updating priority values...");
    await client.unsafe(`
      UPDATE task_specification
      SET priority = 'high'
      WHERE priority = 'critical'
    `);

    // Update any status values from 'in_progress' to 'scheduled' (since we can't change enum easily)
    console.log("Updating status values...");
    await client.unsafe(`
      UPDATE task_specification
      SET status = 'scheduled'
      WHERE status = 'in_progress'
    `);

    // Update any versionStatus values from 'inactive' to 'active' (since we can't change enum easily)
    console.log("Updating version status values...");
    await client.unsafe(`
      UPDATE task_specification
      SET version_status = 'active'
      WHERE version_status = 'inactive'
    `);

    // Check what values we have now
    console.log("\nCurrent status values:");
    const statusResult = await client.unsafe(`
      SELECT DISTINCT status FROM task_specification
    `);
    console.log(statusResult);

    console.log("\nCurrent priority values:");
    const priorityResult = await client.unsafe(`
      SELECT DISTINCT priority FROM task_specification
    `);
    console.log(priorityResult);

    console.log("\nCurrent version_status values:");
    const versionStatusResult = await client.unsafe(`
      SELECT DISTINCT version_status FROM task_specification
    `);
    console.log(versionStatusResult);

    console.log("✅ Task data updated successfully!");
  } catch (error) {
    console.error("❌ Error updating task data:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
