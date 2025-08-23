import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { organization } from "../schema/organization";
import { session, user } from "../schema/user";

// Load environment variables
config({ path: "../.env.local" });
config({ path: "../.env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function fixUserSessions() {
  try {
    console.log("🔧 Fixing user sessions...\n");

    // Find the user by email
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.email, "jyoung2k@gmail.com"))
      .limit(1);

    if (!targetUser.length) {
      console.log("❌ User jyoung2k@gmail.com not found");
      return;
    }

    // Find the organization
    const targetOrg = await db
      .select()
      .from(organization)
      .where(eq(organization.name, "Sophia Medical Center"))
      .limit(1);

    if (!targetOrg.length) {
      console.log("❌ Organization 'Sophia Medical Center' not found");
      return;
    }

    const userId = targetUser[0].id;
    const orgId = targetOrg[0].id;

    console.log(`👤 User: ${targetUser[0].name} (${targetUser[0].email})`);
    console.log(`🏢 Organization: ${targetOrg[0].name} (${orgId})`);
    console.log("");

    // Get all user sessions
    const userSessions = await db
      .select({
        sessionId: session.id,
        activeOrganizationId: session.activeOrganizationId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.userId, userId));

    console.log(`Found ${userSessions.length} sessions for user`);
    console.log("");

    // Update sessions that don't have activeOrganizationId set
    let updatedCount = 0;
    for (const userSession of userSessions) {
      if (!userSession.activeOrganizationId) {
        await db
          .update(session)
          .set({ activeOrganizationId: orgId })
          .where(eq(session.id, userSession.sessionId));

        console.log(
          `✅ Updated session ${userSession.sessionId.slice(0, 8)}...`,
        );
        console.log(
          `   Created: ${userSession.createdAt.toLocaleDateString()}`,
        );
        console.log(`   Set activeOrganizationId to: ${orgId}`);
        updatedCount++;
      } else {
        console.log(
          `ℹ️  Session ${userSession.sessionId.slice(0, 8)}... already has activeOrganizationId`,
        );
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} sessions`);
    console.log("");
    console.log("📋 Next steps:");
    console.log(
      "   1. The user should now be able to see all care plan levels",
    );
    console.log(
      "   2. If still not working, try logging out and logging back in",
    );
    console.log(
      "   3. The session will now have the correct activeOrganizationId",
    );
  } catch (error) {
    console.error("❌ Error fixing user sessions:", error);
  } finally {
    await sql.end();
  }
}

fixUserSessions();

