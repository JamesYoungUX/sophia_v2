import { config } from "dotenv";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { member, organization } from "../schema/organization";
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

async function upgradeUserRole() {
  try {
    console.log("👤 Upgrading user role...\n");

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

    console.log(`User: ${targetUser[0].name} (${targetUser[0].email})`);
    console.log(`Organization: ${targetOrg[0].name}`);
    console.log("");

    // Find existing membership
    const existingMembership = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)));

    if (!existingMembership.length) {
      console.log("❌ User is not a member of this organization");
      return;
    }

    const currentRole = existingMembership[0].role;
    console.log(`Current role: ${currentRole}`);

    if (currentRole === "admin") {
      console.log("ℹ️  User already has admin role");
      return;
    }

    // Upgrade to admin role
    const updatedMembership = await db
      .update(member)
      .set({ role: "admin" })
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)))
      .returning();

    console.log("✅ Successfully upgraded user to admin role!");
    console.log(`   New role: ${updatedMembership[0].role}`);

    // Show all memberships for this user
    const userMemberships = await db
      .select({
        organizationName: organization.name,
        role: member.role,
        createdAt: member.createdAt,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, userId));

    console.log("\n📊 User's organization memberships:");
    userMemberships.forEach((membership, index) => {
      console.log(
        `   ${index + 1}. ${membership.organizationName} - ${membership.role} (since ${membership.createdAt.toLocaleDateString()})`,
      );
    });
  } catch (error) {
    console.error("❌ Error upgrading user role:", error);
  } finally {
    await sql.end();
  }
}

upgradeUserRole();

