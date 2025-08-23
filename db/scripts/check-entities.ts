import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
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

async function checkEntities() {
  try {
    console.log("🔍 Checking database entities...\n");

    // Check organizations
    const orgs = await db.select().from(organization);
    console.log(`📊 Organizations: ${orgs.length}`);
    orgs.forEach((org, index) => {
      console.log(`   ${index + 1}. ${org.name} (${org.id})`);
    });

    // Check teams
    const teams = await db.select().from(team);
    console.log(`\n📊 Teams: ${teams.length}`);
    teams.forEach((team, index) => {
      console.log(
        `   ${index + 1}. ${team.name} (${team.id}) - Org: ${team.organizationId}`,
      );
    });

    // Check users
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
      })
      .from(user);
    console.log(`\n📊 Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(
        `   ${index + 1}. ${user.name || "No name"} (${user.email}) - ${user.id}`,
      );
    });

    console.log("\n✅ Entity check complete!");
  } catch (error) {
    console.error("❌ Error checking entities:", error);
  } finally {
    await sql.end();
  }
}

checkEntities();

