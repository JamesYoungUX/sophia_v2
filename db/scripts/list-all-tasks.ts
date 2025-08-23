import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { taskSpecification } from "../schema/task-management.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function listAllTasks() {
  console.log("📋 Listing all tasks with their new IDs...\n");

  try {
    const tasks = await db
      .select()
      .from(taskSpecification)
      .orderBy(taskSpecification.category, taskSpecification.name);

    console.log(`📊 Found ${tasks.length} total tasks:\n`);

    // Group by category
    const tasksByCategory = tasks.reduce(
      (acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
      },
      {} as Record<string, typeof tasks>,
    );

    Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
      console.log(`🏷️  ${category} (${categoryTasks.length} tasks):`);
      categoryTasks.forEach((task) => {
        console.log(`   • ${task.name}`);
        console.log(`     ID: ${task.taskId}`);
        console.log(`     Priority: ${task.priority}`);
        console.log(`     Status: ${task.status}`);
        console.log("");
      });
    });

    // Summary statistics
    console.log("📈 Summary:");
    console.log(`   Total Tasks: ${tasks.length}`);
    console.log(`   Categories: ${Object.keys(tasksByCategory).length}`);

    const priorityCounts = tasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("   Priority Distribution:");
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      console.log(`     ${priority}: ${count} tasks`);
    });
  } catch (error) {
    console.error("❌ Error listing tasks:", error);
  } finally {
    await client.end();
  }
}

listAllTasks();
