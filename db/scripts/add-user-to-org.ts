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

async function addUserToOrg() {
  try {
    console.log("👤 Adding user to organization...\n");

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

    // Check if membership already exists
    const existingMembership = await db
      .select()
      .from(member)
      .where(and(eq(member.userId, userId), eq(member.organizationId, orgId)));

    if (existingMembership.length > 0) {
      console.log("ℹ️  User is already a member of this organization");
      console.log(`   Role: ${existingMembership[0].role}`);
      console.log(`   Member since: ${existingMembership[0].createdAt}`);
      return;
    }

    // Create membership
    const newMembership = await db
      .insert(member)
      .values({
        userId: userId,
        organizationId: orgId,
        role: "admin", // Give admin role for full access
      })
      .returning();

    console.log("✅ Successfully added user to organization!");
    console.log(`   Role: ${newMembership[0].role}`);
    console.log(`   Member since: ${newMembership[0].createdAt}`);

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
    console.error("❌ Error adding user to organization:", error);
  } finally {
    await sql.end();
  }
}

addUserToOrg();
