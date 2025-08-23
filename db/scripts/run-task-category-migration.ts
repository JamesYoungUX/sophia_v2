import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { resolve } from "path";
import postgres from "postgres";

// Load environment variables
config({ path: resolve(__dirname, "../../.env.local") });
config({ path: resolve(__dirname, "../../.env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log("Running task category migration...");

    // First, drop the enum constraint temporarily
    await sql`ALTER TABLE task_specification ALTER COLUMN category TYPE text`;

    // Update existing tasks to map old categories to new ones
    const updateResult = await sql`
      UPDATE task_specification
      SET category = CASE
        WHEN category = 'Medication' THEN 'Medical'
        WHEN category = 'Assessment' THEN 'Medical'
        WHEN category = 'Monitoring' THEN 'Medical'
        WHEN category = 'Procedure' THEN 'Medical'
        WHEN category = 'Documentation' THEN 'Logistics'
        WHEN category = 'Communication' THEN 'Logistics'
        WHEN category = 'Discharge' THEN 'Logistics'
        WHEN category = 'Follow-up' THEN 'Lifestyle/Health'
        WHEN category = 'Other' THEN 'Logistics'
        ELSE category
      END
      WHERE category IN ('Medication', 'Assessment', 'Monitoring', 'Procedure', 'Documentation', 'Communication', 'Discharge', 'Follow-up', 'Other')
    `;

    console.log(`Updated ${updateResult.count} tasks`);

    // Drop the old enum and recreate it with new values
    await sql`DROP TYPE IF EXISTS task_category CASCADE`;

    // Create the new enum with only the 4 categories
    await sql`
      CREATE TYPE task_category AS ENUM (
        'Education',
        'Lifestyle/Health',
        'Logistics',
        'Medical'
      )
    `;

    // Convert the column back to the enum type
    await sql`ALTER TABLE task_specification ALTER COLUMN category TYPE task_category USING category::task_category`;

    console.log("Task category migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration();
