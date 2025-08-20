import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { patient } from "../schema/patient";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client);

async function clearPatients() {
  try {
    console.log("Clearing all patient data...");
    const result = await db.delete(patient);
    console.log("Successfully cleared all patient data.");
    console.log("All patients have been deleted from the database.");
  } catch (error) {
    console.error("Error clearing patient data:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearPatients();