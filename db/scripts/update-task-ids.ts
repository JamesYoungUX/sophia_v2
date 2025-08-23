import { configDotenv } from "dotenv";
import { eq, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function updateTaskIds() {
  console.log("🔄 Updating task IDs to normalized format...\n");

  try {
    // Get all pre-op education tasks with old format
    const oldTasks = await db
      .select()
      .from(taskSpecification)
      .where(like(taskSpecification.taskId, "preop-edu-%"));

    console.log(`📋 Found ${oldTasks.length} tasks to update:\n`);

    let updateCount = 0;
    for (const task of oldTasks) {
      // Generate new normalized task ID
      // Use timestamp + random for better uniqueness
      const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
      const randomSuffix = crypto.randomUUID().slice(0, 2); // 2 chars from UUID
      const newTaskId = `T-preop-edu-${timestamp}${randomSuffix}`;

      // Update the task
      await db
        .update(taskSpecification)
        .set({
          taskId: newTaskId,
          updatedAt: new Date(),
        })
        .where(eq(taskSpecification.id, task.id));

      console.log(`✅ Updated "${task.name}"`);
      console.log(`   Old ID: ${task.taskId}`);
      console.log(`   New ID: ${newTaskId}\n`);

      updateCount++;
    }

    console.log(
      `🎉 Successfully updated ${updateCount} task IDs to normalized format!`,
    );
    console.log(
      `\nNew format: T-preop-edu-XXXXX (where XXXXX is a 5-digit number)`,
    );
  } catch (error) {
    console.error("❌ Error updating task IDs:", error);
  } finally {
    await client.end();
  }
}

updateTaskIds();
