import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { schema as Db } from "../db/schema";

async function testApiDbConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("Testing API database connection...");
  console.log("Database URL preview:", databaseUrl.substring(0, 30) + "...");

  const client = postgres(databaseUrl, {
    max: 1,
    connect_timeout: 10,
    prepare: false,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    transform: {
      undefined: null,
    },
    onnotice: () => {},
  });

  const db = drizzle(client, { schema: Db });

  try {
    // Test the same query the API uses
    const plans = await db
      .select({
        id: Db.carePlan.id,
        title: Db.carePlan.title,
        description: Db.carePlan.description,
        content: Db.carePlan.content,
      })
      .from(Db.carePlan)
      .limit(3);

    console.log(`Found ${plans.length} care plans:`);

    plans.forEach((plan, index) => {
      console.log(`\nCare Plan ${index + 1}:`);
      console.log(`  ID: ${plan.id}`);
      console.log(`  Title: ${plan.title}`);
      console.log(`  Has Content: ${!!plan.content}`);
      console.log(`  Content Type: ${typeof plan.content}`);
      if (plan.content) {
        console.log(
          `  Content Preview: ${JSON.stringify(plan.content).substring(0, 100)}...`,
        );
      }
    });
  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await client.end();
  }
}

// Run the test
testApiDbConnection()
  .then(() => {
    console.log("Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });


