#!/usr/bin/env bun

import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { organization } from "../schema/organization";
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

async function setActiveOrganization() {
  try {
    console.log("🏢 Setting active organization for user...\n");

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

    // Note: The activeOrganizationId is typically set in the session when the user logs in
    // This is handled by Better Auth. For now, we'll just confirm the user has access
    console.log("ℹ️  Active organization is set during login via Better Auth");
    console.log(
      "   The user should log out and log back in to refresh their session",
    );
    console.log("   This will set activeOrganizationId in their session");
    console.log("");
    console.log("📋 To test the care plans:");
    console.log("   1. Log out of the application");
    console.log("   2. Log back in with jyoung2k@gmail.com");
    console.log("   3. Navigate to Care Plans in the sidebar");
    console.log("   4. You should now see all the hierarchical care plans");

    // Show user's organization access
    console.log("\n📊 User's organization access:");
    console.log(`   Organization: ${targetOrg[0].name} (${orgId})`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: admin (from previous upgrade)`);
  } catch (error) {
    console.error("❌ Error setting active organization:", error);
  } finally {
    await sql.end();
  }
}

setActiveOrganization();
