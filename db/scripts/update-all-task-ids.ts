import { configDotenv } from "dotenv";
import { eq, like, not } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function updateAllTaskIds() {
  console.log("🔄 Updating all task IDs to new timestamp-based format...\n");

  try {
    // Get all tasks that don't already have the new format (T- prefix)
    const oldTasks = await db
      .select()
      .from(taskSpecification)
      .where(not(like(taskSpecification.taskId, "T-%")));

    console.log(`📋 Found ${oldTasks.length} tasks to update:\n`);

    let updateCount = 0;
    for (const task of oldTasks) {
      // Determine the category prefix based on the task category
      let categoryPrefix = "task";

      switch (task.category) {
        case "Education":
          categoryPrefix = "edu";
          break;
        case "Medication":
          categoryPrefix = "med";
          break;
        case "Assessment":
          categoryPrefix = "assess";
          break;
        case "Monitoring":
          categoryPrefix = "monitor";
          break;
        case "Procedure":
          categoryPrefix = "proc";
          break;
        case "Documentation":
          categoryPrefix = "doc";
          break;
        case "Communication":
          categoryPrefix = "comm";
          break;
        case "Discharge":
          categoryPrefix = "discharge";
          break;
        case "Follow-up":
          categoryPrefix = "followup";
          break;
        default:
          categoryPrefix = "task";
      }

      // Generate new normalized task ID
      // Use timestamp + random for better uniqueness
      const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
      const randomSuffix = crypto.randomUUID().slice(0, 2); // 2 chars from UUID
      const newTaskId = `T-${categoryPrefix}-${timestamp}${randomSuffix}`;

      // Update the task
      await db
        .update(taskSpecification)
        .set({
          taskId: newTaskId,
          updatedAt: new Date(),
        })
        .where(eq(taskSpecification.id, task.id));

      console.log(`✅ Updated "${task.name}"`);
      console.log(`   Category: ${task.category}`);
      console.log(`   Old ID: ${task.taskId}`);
      console.log(`   New ID: ${newTaskId}\n`);

      updateCount++;
    }

    console.log(
      `🎉 Successfully updated ${updateCount} task IDs to new format!`,
    );
    console.log(
      `\nNew format: T-{category}-{timestamp}{random} (e.g., T-edu-34567ab)`,
    );

    // Show summary of categories updated
    const categoryCounts = oldTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📊 Categories updated:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} tasks`);
    });
  } catch (error) {
    console.error("❌ Error updating task IDs:", error);
  } finally {
    await client.end();
  }
}

updateAllTaskIds();
