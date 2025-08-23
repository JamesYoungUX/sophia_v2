import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { carePlan } from "../schema/care-plan";
import { organization } from "../schema/organization";
import { team } from "../schema/team";
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

async function seedHierarchicalPlans() {
  try {
    console.log("🌱 Seeding hierarchical care plans...\n");

    // Get existing Sophia plans
    const sophiaPlans = await db
      .select({
        id: carePlan.id,
        title: carePlan.title,
        description: carePlan.description,
        content: carePlan.content,
        createdBy: carePlan.createdBy,
      })
      .from(carePlan)
      .where(eq(carePlan.planLevel, "system"));

    console.log(
      `Found ${sophiaPlans.length} Sophia plans to use as templates\n`,
    );

    // Get first organization and team for seeding
    const firstOrg = await db.select().from(organization).limit(1);
    const firstTeam = await db.select().from(team).limit(1);
    const firstUser = await db.select().from(user).limit(1);

    if (!firstOrg.length || !firstTeam.length || !firstUser.length) {
      console.log(
        "❌ Need at least one organization, team, and user to seed hierarchical plans",
      );
      return;
    }

    const orgId = firstOrg[0].id;
    const teamId = firstTeam[0].id;
    const userId = firstUser[0].id;

    console.log(`Using organization: ${orgId}`);
    console.log(`Using team: ${teamId}`);
    console.log(`Using user: ${userId}\n`);

    // Create organization plans (derived from Sophia plans)
    console.log("🏢 Creating organization plans...");
    for (const sophiaPlan of sophiaPlans) {
      const orgPlan = await db
        .insert(carePlan)
        .values({
          title: `${sophiaPlan.title} (Organization Version)`,
          description: `${sophiaPlan.description} - Adapted for organization-specific needs`,
          content: {
            ...sophiaPlan.content,
            organizationModifications: {
              adaptedFor: "Organization-specific protocols",
              modifiedAt: new Date().toISOString(),
              modifications: [
                "Added organization-specific guidelines",
                "Updated medication protocols",
              ],
            },
          },
          planLevel: "organization",
          organizationId: orgId,
          copiedFrom: sophiaPlan.id,
          originalPlanId: sophiaPlan.id,
          isTemplate: false,
          status: "active",
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      console.log(`   Created: ${orgPlan[0].title}`);
    }

    // Get the organization plans we just created
    const orgPlans = await db
      .select({
        id: carePlan.id,
        title: carePlan.title,
        content: carePlan.content,
        copiedFrom: carePlan.copiedFrom,
      })
      .from(carePlan)
      .where(eq(carePlan.planLevel, "organization"));

    // Create team plans (derived from organization plans)
    console.log("\n👥 Creating team plans...");
    for (const orgPlan of orgPlans) {
      const teamPlan = await db
        .insert(carePlan)
        .values({
          title: `${orgPlan.title.replace(" (Organization Version)", "")} (Team Version)`,
          description: `${orgPlan.title} - Adapted for team-specific workflows`,
          content: {
            ...orgPlan.content,
            teamModifications: {
              adaptedFor: "Team-specific workflows",
              modifiedAt: new Date().toISOString(),
              modifications: [
                "Added team-specific procedures",
                "Updated workflow steps",
              ],
            },
          },
          planLevel: "team",
          organizationId: orgId,
          teamId: teamId,
          copiedFrom: orgPlan.id,
          originalPlanId: orgPlan.copiedFrom, // Points back to original Sophia plan
          isTemplate: false,
          status: "active",
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      console.log(`   Created: ${teamPlan[0].title}`);
    }

    // Get the team plans we just created
    const teamPlans = await db
      .select({
        id: carePlan.id,
        title: carePlan.title,
        content: carePlan.content,
        copiedFrom: carePlan.copiedFrom,
      })
      .from(carePlan)
      .where(eq(carePlan.planLevel, "team"));

    // Create personal plans (derived from team plans)
    console.log("\n👤 Creating personal plans...");
    for (const teamPlan of teamPlans) {
      const personalPlan = await db
        .insert(carePlan)
        .values({
          title: `${teamPlan.title.replace(" (Team Version)", "")} (Personal)`,
          description: `${teamPlan.title} - Personalized version`,
          content: {
            ...teamPlan.content,
            personalModifications: {
              adaptedFor: "Personal preferences",
              modifiedAt: new Date().toISOString(),
              modifications: [
                "Added personal notes",
                "Customized workflow preferences",
              ],
            },
          },
          planLevel: "personal",
          organizationId: orgId,
          teamId: teamId,
          copiedFrom: teamPlan.id,
          originalPlanId: teamPlan.copiedFrom, // Points back to original Sophia plan
          isTemplate: false,
          status: "draft",
          createdBy: userId,
          updatedBy: userId,
        })
        .returning();

      console.log(`   Created: ${personalPlan[0].title}`);
    }

    console.log("\n✅ Hierarchical care plans seeded successfully!");

    // Show summary
    const allPlans = await db
      .select({
        planLevel: carePlan.planLevel,
        count: sql`count(*)`,
      })
      .from(carePlan)
      .groupBy(carePlan.planLevel);

    console.log("\n📊 Final Care Plan Distribution:");
    allPlans.forEach((level) => {
      console.log(`   ${level.planLevel}: ${level.count}`);
    });
  } catch (error) {
    console.error("❌ Error seeding hierarchical plans:", error);
  } finally {
    await sql.end();
  }
}

seedHierarchicalPlans();
