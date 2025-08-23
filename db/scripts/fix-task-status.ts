import { configDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function fixTaskStatus() {
  console.log("🔄 Fixing task status and version status...\n");

  try {
    // Get all tasks that are currently scheduled (wrong status)
    const scheduledTasks = await db
      .select()
      .from(taskSpecification)
      .where(eq(taskSpecification.status, "scheduled"));

    console.log(`📋 Found ${scheduledTasks.length} tasks to fix:\n`);

    let updateCount = 0;
    for (const task of scheduledTasks) {
      // Fix: Set status back to "pending" and versionStatus to "active"
      await db
        .update(taskSpecification)
        .set({
          status: "pending", // Revert back to pending
          versionStatus: "active", // Set version status to active as requested
          updatedAt: new Date(),
        })
        .where(eq(taskSpecification.id, task.id));

      console.log(`✅ Fixed "${task.name}"`);
      console.log(`   Category: ${task.category}`);
      console.log(`   ID: ${task.taskId}`);
      console.log(`   Status: scheduled → pending`);
      console.log(`   Version Status: draft → active\n`);

      updateCount++;
    }

    console.log(`🎉 Successfully fixed ${updateCount} tasks!`);

    // Show final status distribution
    const allTasks = await db.select().from(taskSpecification);
    const statusCounts = allTasks.reduce(
      (acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const versionStatusCounts = allTasks.reduce(
      (acc, task) => {
        acc[task.versionStatus] = (acc[task.versionStatus] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📈 Final status distribution:");
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   Status ${status}: ${count} tasks`);
    });

    console.log("\n📈 Final version status distribution:");
    Object.entries(versionStatusCounts).forEach(([versionStatus, count]) => {
      console.log(`   Version Status ${versionStatus}: ${count} tasks`);
    });
  } catch (error) {
    console.error("❌ Error fixing task status:", error);
  } finally {
    await client.end();
  }
}

fixTaskStatus();
