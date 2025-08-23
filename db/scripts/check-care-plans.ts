import { configDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { carePlan } from "../schema/care-plan.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function checkCarePlans() {
  console.log("🔍 Checking care plans by level...\n");

  try {
    // Check Sophia plans (system level)
    const sophiaPlans = await db
      .select()
      .from(carePlan)
      .where(eq(carePlan.planLevel, "system"));
    console.log(`🏛️  Sophia Plans (System): ${sophiaPlans.length}`);
    sophiaPlans.forEach((plan) => {
      console.log(`   - ${plan.title} (${plan.id})`);
    });

    // Check organization plans
    const orgPlans = await db
      .select()
      .from(carePlan)
      .where(eq(carePlan.planLevel, "organization"));
    console.log(`\n🏢 Organization Plans: ${orgPlans.length}`);
    orgPlans.forEach((plan) => {
      console.log(`   - ${plan.title} (${plan.id})`);
    });

    // Check team plans
    const teamPlans = await db
      .select()
      .from(carePlan)
      .where(eq(carePlan.planLevel, "team"));
    console.log(`\n👥 Team Plans: ${teamPlans.length}`);
    teamPlans.forEach((plan) => {
      console.log(`   - ${plan.title} (${plan.id})`);
    });

    // Check personal plans
    const personalPlans = await db
      .select()
      .from(carePlan)
      .where(eq(carePlan.planLevel, "personal"));
    console.log(`\n👤 Personal Plans: ${personalPlans.length}`);
    personalPlans.forEach((plan) => {
      console.log(`   - ${plan.title} (${plan.id})`);
    });

    console.log(
      `\n📊 Total Plans: ${sophiaPlans.length + orgPlans.length + teamPlans.length + personalPlans.length}`,
    );
  } catch (error) {
    console.error("❌ Error checking care plans:", error);
  } finally {
    await client.end();
  }
}

checkCarePlans();
