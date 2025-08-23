import { configDotenv } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { session } from "../schema/user.js";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function fixAllSessions() {
  console.log("🔧 Fixing all user sessions...\n");

  try {
    // Get the organization ID for Sophia Medical Center
    const orgResult = await client`
      SELECT id FROM organization WHERE name = 'Sophia Medical Center' LIMIT 1
    `;

    if (orgResult.length === 0) {
      console.log("❌ No organization found");
      return;
    }

    const organizationId = orgResult[0].id;
    console.log(`🏢 Organization ID: ${organizationId}`);

    // Get all sessions for the user
    const userSessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, "0198c8f2-0221-7524-b915-d3361906972c"));

    console.log(`👤 Found ${userSessions.length} sessions for user`);

    let updatedCount = 0;
    for (const userSession of userSessions) {
      if (!userSession.activeOrganizationId) {
        console.log(`🔄 Updating session ${userSession.id}...`);

        await db
          .update(session)
          .set({ activeOrganizationId: organizationId })
          .where(eq(session.id, userSession.id));

        updatedCount++;
        console.log(`✅ Updated session ${userSession.id}`);
      } else {
        console.log(
          `ℹ️  Session ${userSession.id} already has activeOrganizationId: ${userSession.activeOrganizationId}`,
        );
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} sessions`);
    console.log("\n📋 Next steps:");
    console.log("   1. Log out and log back in to get a fresh session");
    console.log("   2. You should now see organization and team plans");
    console.log("   3. The session will have the correct activeOrganizationId");
  } catch (error) {
    console.error("❌ Error fixing sessions:", error);
  } finally {
    await client.end();
  }
}

fixAllSessions();
