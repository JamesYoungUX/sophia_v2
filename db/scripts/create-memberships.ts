#!/usr/bin/env bun

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import schema from "../schema";

// Import drizzle config to trigger environment loading
import "../drizzle.config";

const client = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(client, { schema });

try {
  // Get the organization
  const orgs = await db.select().from(schema.organization);
  if (orgs.length === 0) {
    console.log("No organizations found");
  } else {
    const org = orgs[0];
    console.log(`Using organization: ${org.name} (${org.id})`);

    // Get all users
    const users = await db.select().from(schema.user);
    console.log(`Found ${users.length} users`);

    // Create memberships for all users
    for (const user of users) {
      try {
        await db
          .insert(schema.member)
          .values({
            userId: user.id,
            organizationId: org.id,
            role: "member", // Default role, you can adjust as needed
          })
          .onConflictDoNothing(); // Avoid duplicates if re-running

        console.log(`✅ Created membership for ${user.name} (${user.email})`);
      } catch (error) {
        console.log(`⚠️  Error creating membership for ${user.email}:`, error);
      }
    }

    // Verify memberships
    const memberships = await db
      .select({
        userId: schema.member.userId,
        organizationId: schema.member.organizationId,
        role: schema.member.role,
        userName: schema.user.name,
        userEmail: schema.user.email,
      })
      .from(schema.member)
      .innerJoin(schema.user, eq(schema.user.id, schema.member.userId));

    console.log("\nAll memberships:");
    memberships.forEach((membership) =>
      console.log(
        `- ${membership.userName} (${membership.userEmail}) - Role: ${membership.role}`,
      ),
    );
  }
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}
