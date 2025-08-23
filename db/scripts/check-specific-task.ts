import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
config({ path: "../.env.local" });
config({ path: "../.env" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const sql = postgres(DATABASE_URL);
const db = drizzle(sql);

async function checkSpecificTask() {
  try {
    console.log("🔍 Checking specific task: T-edu-0440123");

    const task = await db
      .select()
      .from(taskSpecification)
      .where(eq(taskSpecification.taskId, "T-edu-0440123"))
      .limit(1);

    if (task.length === 0) {
      console.log("❌ Task not found");
      return;
    }

    const taskData = task[0];
    console.log("📋 Task data:");
    console.log(JSON.stringify(taskData, null, 2));

    console.log("\n🔍 Specific fields:");
    console.log(
      `Priority: "${taskData.priority}" (type: ${typeof taskData.priority})`,
    );
    console.log(
      `Status: "${taskData.status}" (type: ${typeof taskData.status})`,
    );
    console.log(
      `Version Status: "${taskData.versionStatus}" (type: ${typeof taskData.versionStatus})`,
    );
  } catch (error) {
    console.error("❌ Error checking task:", error);
  } finally {
    await sql.end();
  }
}

checkSpecificTask();
