import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { carePlan } from "../schema/care-plan";
import { user } from "../schema/user";

// Load environment variables
config({ path: "../.env.local" });
config({ path: "../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function updatePersonalPlansOwner() {
  try {
    console.log("👤 Updating personal plans owner...\n");

    // Find the target user (jyoung2k@gmail.com)
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.email, "jyoung2k@gmail.com"))
      .limit(1);

    if (!targetUser.length) {
      console.log("❌ User jyoung2k@gmail.com not found");
      return;
    }

    const newOwnerId = targetUser[0].id;
    console.log(`👤 New owner: ${targetUser[0].name} (${targetUser[0].email})`);
    console.log(`   ID: ${newOwnerId}`);
    console.log("");

    // Find all personal plans
    const personalPlans = await db
      .select({
        id: carePlan.id,
        title: carePlan.title,
        createdBy: carePlan.createdBy,
        updatedBy: carePlan.updatedBy,
      })
      .from(carePlan)
      .where(eq(carePlan.planLevel, "personal"));

    console.log(`Found ${personalPlans.length} personal plans:`);
    personalPlans.forEach((plan, index) => {
      console.log(`   ${index + 1}. ${plan.title}`);
      console.log(`      Current owner: ${plan.createdBy}`);
      console.log(`      Current updater: ${plan.updatedBy}`);
    });
    console.log("");

    // Update the personal plans to be owned by the new user
    let updatedCount = 0;
    for (const plan of personalPlans) {
      await db
        .update(carePlan)
        .set({
          createdBy: newOwnerId,
          updatedBy: newOwnerId,
        })
        .where(eq(carePlan.id, plan.id));

      console.log(`✅ Updated: ${plan.title}`);
      console.log(`   New owner: ${newOwnerId}`);
      updatedCount++;
    }

    console.log(`\n🎉 Updated ${updatedCount} personal plans`);
    console.log("");
    console.log("📋 Next steps:");
    console.log(
      "   1. The user should now be able to see personal plans in 'My Plans'",
    );
    console.log("   2. Refresh the browser to see the changes");
  } catch (error) {
    console.error("❌ Error updating personal plans owner:", error);
  } finally {
    await sql.end();
  }
}

updatePersonalPlansOwner();

