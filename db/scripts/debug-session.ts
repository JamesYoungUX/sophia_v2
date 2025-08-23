import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { carePlan } from "../schema/care-plan";
import { member, organization } from "../schema/organization";
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

async function debugSession() {
  try {
    console.log("🔍 Debugging user session and organization access...\n");

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

    const userId = targetUser[0].id;
    console.log(`👤 User: ${targetUser[0].name} (${targetUser[0].email})`);
    console.log(`   ID: ${userId}`);
    console.log("");

    // Check user's organization memberships
    const memberships = await db
      .select({
        organizationName: organization.name,
        organizationId: organization.id,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, userId));

    console.log("📊 Organization Memberships:");
    if (memberships.length === 0) {
      console.log("   ❌ No organization memberships found");
    } else {
      memberships.forEach((membership, index) => {
        console.log(
          `   ${index + 1}. ${membership.organizationName} (${membership.organizationId})`,
        );
        console.log(`      Role: ${membership.role}`);
        console.log(
          `      Member since: ${membership.createdAt.toLocaleDateString()}`,
        );
      });
    }
    console.log("");

    // Check user's sessions
    const userSessions = await db
      .select({
        sessionId: session.id,
        activeOrganizationId: session.activeOrganizationId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.userId, userId));

    console.log("🔐 User Sessions:");
    if (userSessions.length === 0) {
      console.log("   ❌ No active sessions found");
    } else {
      userSessions.forEach((userSession, index) => {
        console.log(
          `   ${index + 1}. Session ${userSession.sessionId.slice(0, 8)}...`,
        );
        console.log(
          `      Active Organization: ${userSession.activeOrganizationId || "Not set"}`,
        );
        console.log(
          `      Created: ${userSession.createdAt.toLocaleDateString()}`,
        );
        console.log(
          `      Expires: ${userSession.expiresAt?.toLocaleDateString() || "No expiry"}`,
        );
      });
    }
    console.log("");

    // Check care plans for the organization
    if (memberships.length > 0) {
      const orgId = memberships[0].organizationId;
      console.log(`🏥 Care Plans for Organization (${orgId}):`);

      const carePlans = await db
        .select({
          id: carePlan.id,
          title: carePlan.title,
          planLevel: carePlan.planLevel,
          organizationId: carePlan.organizationId,
          status: carePlan.status,
        })
        .from(carePlan)
        .where(eq(carePlan.organizationId, orgId))
        .orderBy(carePlan.planLevel);

      if (carePlans.length === 0) {
        console.log("   ❌ No care plans found for this organization");
      } else {
        console.log(`   Found ${carePlans.length} care plans:`);
        carePlans.forEach((plan, index) => {
          console.log(`   ${index + 1}. ${plan.title}`);
          console.log(`      Level: ${plan.planLevel}`);
          console.log(`      Status: ${plan.status}`);
        });
      }
    }

    console.log("\n💡 Recommendations:");
    console.log("   1. If no sessions found: User needs to log in");
    console.log(
      "   2. If activeOrganizationId is not set: User needs to log out and log back in",
    );
    console.log(
      "   3. If no memberships: User needs to be added to organization",
    );
    console.log(
      "   4. If no care plans: Care plans need to be created for the organization",
    );
  } catch (error) {
    console.error("❌ Error debugging session:", error);
  } finally {
    await sql.end();
  }
}

debugSession();
