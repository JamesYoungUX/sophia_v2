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
  console.log("=== CREATING NEW SESSION FOR USER ===\n");

  // Get the organization
  const orgs = await db.select().from(schema.organization);
  if (orgs.length === 0) {
    console.log("No organizations found");
    return;
  }

  const org = orgs[0];
  console.log(`Using organization: ${org.name} (${org.id})`);

  // Find the user
  const users = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.email, "jyoung2k@gmail.com"));

  if (users.length === 0) {
    console.log("User jyoung2k@gmail.com not found");
    return;
  }

  const user = users[0];
  console.log(`Found user: ${user.name} (${user.email})`);

  // Delete old sessions for this user
  const deletedSessions = await db
    .delete(schema.session)
    .where(eq(schema.session.userId, user.id));

  console.log(`Deleted ${deletedSessions.rowCount} old sessions`);

  // Create a new session with active organization
  const newSession = await db
    .insert(schema.session)
    .values({
      userId: user.id,
      token: `new-session-${Date.now()}`, // This will be replaced by Better Auth
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      activeOrganizationId: org.id,
      ipAddress: "127.0.0.1",
      userAgent: "Manual session creation",
    })
    .returning();

  console.log(`✅ Created new session: ${newSession[0].id}`);
  console.log(`Active organization: ${newSession[0].activeOrganizationId}`);

  // Verify the session
  const sessions = await db
    .select({
      id: schema.session.id,
      userId: schema.session.userId,
      activeOrganizationId: schema.session.activeOrganizationId,
      expiresAt: schema.session.expiresAt,
      userName: schema.user.name,
      userEmail: schema.user.email,
    })
    .from(schema.session)
    .innerJoin(schema.user, eq(schema.user.id, schema.session.userId))
    .where(eq(schema.session.userId, user.id));

  console.log("\nCurrent sessions for user:");
  sessions.forEach((session) =>
    console.log(
      `- Session ${session.id.slice(0, 8)}... - Active Org: ${session.activeOrganizationId ? "Set" : "Not set"} - Expires: ${session.expiresAt}`,
    ),
  );
} catch (error) {
  console.error("Error:", error);
} finally {
  await client.end();
}


