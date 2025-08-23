import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables
configDotenv({ path: "../.env.local" });
configDotenv({ path: "../.env" });

const connectionString = process.env.DATABASE_URL!;
console.log("🔗 Connecting to database...");
console.log("📡 DATABASE_URL:", connectionString.substring(0, 50) + "...");

const client = postgres(connectionString);
const db = drizzle(client);

async function checkTables() {
  console.log("🔍 Checking database tables...\n");

  try {
    const result = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    console.log(`📊 Found ${result.length} tables:`);
    result.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });
  } catch (error) {
    console.error("❌ Error checking tables:", error);
  } finally {
    await client.end();
  }
}

checkTables();
