import { configDotenv } from "dotenv";
import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function activateTasks() {
  console.log("🔄 Activating all tasks...\n");

  try {
    // Get all tasks that are currently pending
    const pendingTasks = await db
      .select()
      .from(taskSpecification)
      .where(inArray(taskSpecification.status, ["pending"]));

    console.log(`📋 Found ${pendingTasks.length} tasks to activate:\n`);

    let updateCount = 0;
    for (const task of pendingTasks) {
      // Update the task status to active
      await db
        .update(taskSpecification)
        .set({
          status: "scheduled",
          updatedAt: new Date(),
        })
        .where(eq(taskSpecification.id, task.id));

      console.log(`✅ Activated "${task.name}"`);
      console.log(`   Category: ${task.category}`);
      console.log(`   ID: ${task.taskId}`);
      console.log(`   Old Status: ${task.status}`);
      console.log(`   New Status: scheduled\n`);

      updateCount++;
    }

    console.log(`🎉 Successfully activated ${updateCount} tasks!`);

    // Show summary of activated tasks by category
    const categoryCounts = pendingTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📊 Tasks activated by category:");
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} tasks`);
    });

    // Show final status distribution
    const allTasks = await db.select().from(taskSpecification);
    const statusCounts = allTasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📈 Final status distribution:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tasks`);
    });
  } catch (error) {
    console.error("❌ Error activating tasks:", error);
  } finally {
    await client.end();
  }
}

activateTasks();
