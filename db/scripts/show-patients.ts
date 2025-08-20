import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { patient } from '../schema/patient';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../.env.local' });
config({ path: '../.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function showPatients() {
  try {
    console.log('🏥 Fetching patients from the database...\n');
    
    const patients = await db.select({
      patId: patient.patId,
      patName: patient.patName,
      birthDate: patient.birthDate,
      sexCName: patient.sexCName,
      ethnicGroupCName: patient.ethnicGroupCName,
      languageCName: patient.languageCName,
      religionCName: patient.religionCName,
      city: patient.city,
      stateCName: patient.stateCName,
      zip: patient.zip,
      homePhone: patient.homePhone,
      emailAddress: patient.emailAddress
    }).from(patient).orderBy(patient.patId);

    console.log(`Found ${patients.length} patients in the database:\n`);
    
    patients.forEach((p, index) => {
      console.log(`${index + 1}. ${p.patId} - ${p.patName}`);
      console.log(`   Birth Date: ${p.birthDate}`);
      console.log(`   Sex: ${p.sexCName}`);
      console.log(`   Ethnicity: ${p.ethnicGroupCName}`);
      console.log(`   Language: ${p.languageCName}`);
      console.log(`   Religion: ${p.religionCName}`);
      console.log(`   Location: ${p.city}, ${p.stateCName} ${p.zip}`);
      console.log(`   Phone: ${p.homePhone}`);
      console.log(`   Email: ${p.emailAddress}`);
      console.log('   ---');
    });
    
    console.log(`\n✅ Total patients in pool: ${patients.length}`);
    
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
  } finally {
    await sql.end();
  }
}

showPatients();