import { eq, inArray } from "drizzle-orm";
import { createDbDirect } from "../../apps/api/lib/db-direct.js";
import { Db } from "../index.js";

async function updateSystemPlans() {
  const db = createDbDirect();

  try {
    console.log("Updating care plans to system level...");

    // Mark existing care plans as system-level templates
    const result1 = await db
      .update(Db.carePlan)
      .set({
        planLevel: "system",
        isTemplate: true,
      })
      .where(
        inArray(Db.carePlan.title, [
          "Hypertension Management Protocol",
          "Type 2 Diabetes Management Protocol",
          "Enhanced Recovery After Surgery Protocol",
        ]),
      );

    console.log("Updated plan levels to system");

    // Set organization_id to NULL for system plans
    const result2 = await db
      .update(Db.carePlan)
      .set({ organizationId: null })
      .where(eq(Db.carePlan.planLevel, "system"));

    console.log("Set organization_id to NULL for system plans");

    // Verify the changes
    const systemPlans = await db
      .select({
        id: Db.carePlan.id,
        title: Db.carePlan.title,
        planLevel: Db.carePlan.planLevel,
        isTemplate: Db.carePlan.isTemplate,
        organizationId: Db.carePlan.organizationId,
      })
      .from(Db.carePlan)
      .where(eq(Db.carePlan.planLevel, "system"));

    console.log(`Found ${systemPlans.length} system plans:`);
    systemPlans.forEach((plan) => {
      console.log(
        `  - ${plan.title} (${plan.planLevel}, template: ${plan.isTemplate}, org: ${plan.organizationId})`,
      );
    });

    console.log("System plans updated successfully!");
  } catch (error) {
    console.error("Error updating system plans:", error);
    throw error;
  }
}

updateSystemPlans().catch(console.error);
