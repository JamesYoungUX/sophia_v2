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

async function debugCurrentSession() {
  console.log("🔍 Debugging current session...\n");

  try {
    // Get all sessions for the user
    const userSessions = await db
      .select()
      .from(session)
      .where(eq(session.userId, "0198c8f2-0221-7524-b915-d3361906972c"));

    console.log(
      `👤 Found ${userSessions.length} sessions for user 0198c8f2-0221-7524-b915-d3361906972c:\n`,
    );

    userSessions.forEach((sess, index) => {
      console.log(`Session ${index + 1}:`);
      console.log(`  ID: ${sess.id}`);
      console.log(`  Created: ${sess.createdAt}`);
      console.log(`  Expires: ${sess.expiresAt}`);
      console.log(
        `  Active Organization ID: ${sess.activeOrganizationId || "NULL"}`,
      );
      console.log(`  User ID: ${sess.userId}`);
      console.log("");
    });

    // Check if any sessions are missing activeOrganizationId
    const sessionsWithoutOrg = userSessions.filter(
      (s) => !s.activeOrganizationId,
    );
    console.log(
      `⚠️  Sessions without activeOrganizationId: ${sessionsWithoutOrg.length}`,
    );

    if (sessionsWithoutOrg.length > 0) {
      console.log("\n🔧 Sessions that need fixing:");
      sessionsWithoutOrg.forEach((s) => {
        console.log(`  - ${s.id} (created: ${s.createdAt})`);
      });
    }
  } catch (error) {
    console.error("❌ Error debugging sessions:", error);
  } finally {
    await client.end();
  }
}

debugCurrentSession();
