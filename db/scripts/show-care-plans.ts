import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { carePlan } from "../schema/care-plan";

// Load environment variables
config({ path: "../.env.local" });
config({ path: "../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function showCarePlans() {
  try {
    console.log("🏥 Fetching care plans from the database...\n");

    const plans = await db
      .select({
        id: carePlan.id,
        title: carePlan.title,
        description: carePlan.description,
        planLevel: carePlan.planLevel,
        status: carePlan.status,
        organizationId: carePlan.organizationId,
        teamId: carePlan.teamId,
        copiedFrom: carePlan.copiedFrom,
        originalPlanId: carePlan.originalPlanId,
        isTemplate: carePlan.isTemplate,
        versionNumber: carePlan.versionNumber,
        createdAt: carePlan.createdAt,
        createdBy: carePlan.createdBy,
        content: carePlan.content,
      })
      .from(carePlan)
      .orderBy(carePlan.planLevel, carePlan.createdAt);

    console.log(`Found ${plans.length} care plans in the database:\n`);

    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.title}`);
      console.log(`   ID: ${plan.id}`);
      console.log(`   Level: ${plan.planLevel}`);
      console.log(`   Status: ${plan.status}`);
      console.log(`   Version: ${plan.versionNumber}`);
      console.log(`   Template: ${plan.isTemplate}`);
      console.log(`   Organization: ${plan.organizationId || "None"}`);
      console.log(`   Team: ${plan.teamId || "None"}`);
      console.log(`   Copied From: ${plan.copiedFrom || "None"}`);
      console.log(`   Original Plan: ${plan.originalPlanId || "None"}`);
      console.log(`   Created: ${plan.createdAt}`);
      console.log(`   Created By: ${plan.createdBy}`);
      console.log(
        `   Content Keys: ${plan.content ? Object.keys(plan.content).join(", ") : "None"}`,
      );
      console.log("   ---");
    });

    console.log(`\n✅ Total care plans: ${plans.length}`);

    // Group by plan level
    const byLevel = plans.reduce(
      (acc, plan) => {
        acc[plan.planLevel] = (acc[plan.planLevel] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📊 Care Plans by Level:");
    Object.entries(byLevel).forEach(([level, count]) => {
      console.log(`   ${level}: ${count}`);
    });
  } catch (error) {
    console.error("❌ Error fetching care plans:", error);
  } finally {
    await sql.end();
  }
}

showCarePlans();

