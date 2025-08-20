import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { patient } from "../db/schema/patient.js";

// Type declaration for Node.js process
declare const process: {
  env: Record<string, string | undefined>;
};

const DEBUG_LOG = true;

async function testPatientAPI() {
  if (DEBUG_LOG) console.log("Starting patient API test...");
  
  try {
    // Create database connection
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("No database connection string found in environment variables");
    }
    
    if (DEBUG_LOG) console.log("Connecting to database...");
    const sql = postgres(connectionString);
    const db = drizzle(sql);
    
    // Test patient query
    if (DEBUG_LOG) console.log("Querying patients...");
    const patients = await db
      .select({
        patId: patient.patId,
        firstName: patient.patFirstName,
        lastName: patient.patLastName,
        middleName: patient.patMiddleName,
        birthDate: patient.birthDate,
        sex: patient.sexCName,
        city: patient.city,
        state: patient.stateCName,
        zip: patient.zip,
        phone: patient.homePhone,
        email: patient.emailAddress,
        ethnicity: patient.ethnicGroupCName,
        language: patient.languageCName,
        religion: patient.religionCName,
      })
      .from(patient)
      .limit(5)
      .orderBy(patient.patLastName, patient.patFirstName);
    
    if (DEBUG_LOG) console.log(`Found ${patients.length} patients:`);
    patients.forEach((p, index) => {
      if (DEBUG_LOG) console.log(`${index + 1}. ${p.lastName}, ${p.firstName} (${p.patId})`);
    });
    
    await sql.end();
    if (DEBUG_LOG) console.log("Test completed successfully!");
    
    return patients;
  } catch (error) {
    console.error("Error testing patient API:", error);
    throw error;
  }
}

// Run the test
testPatientAPI().catch(console.error);