import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { organization } from "../schema/organization";
import { team } from "../schema/team";

// Load environment variables
config({ path: "../.env.local" });
config({ path: "../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function seedTeams() {
  try {
    console.log("👥 Seeding teams...\n");

    // Get the first organization
    const orgs = await db.select().from(organization).limit(1);
    if (!orgs.length) {
      console.log(
        "❌ No organizations found. Please seed organizations first.",
      );
      return;
    }

    const orgId = orgs[0].id;
    console.log(`Using organization: ${orgs[0].name} (${orgId})\n`);

    // Create teams
    const teams = [
      {
        name: "Cardiology Team",
        description: "Specialized team for cardiac care protocols",
        organizationId: orgId,
      },
      {
        name: "Emergency Medicine Team",
        description: "Emergency care and trauma protocols",
        organizationId: orgId,
      },
      {
        name: "Primary Care Team",
        description: "General practice and preventive care",
        organizationId: orgId,
      },
      {
        name: "Surgery Team",
        description: "Surgical procedures and perioperative care",
        organizationId: orgId,
      },
    ];

    for (const teamData of teams) {
      const newTeam = await db.insert(team).values(teamData).returning();
      console.log(`✅ Created: ${newTeam[0].name}`);
    }

    console.log("\n🎉 Teams seeded successfully!");

    // Show all teams
    const allTeams = await db.select().from(team);
    console.log(`\n📊 Total teams: ${allTeams.length}`);
    allTeams.forEach((team, index) => {
      console.log(`   ${index + 1}. ${team.name} (${team.id})`);
    });
  } catch (error) {
    console.error("❌ Error seeding teams:", error);
  } finally {
    await sql.end();
  }
}

seedTeams();

