/* SPDX-FileCopyrightText: 2014-present Kriasoft */
/* SPDX-License-Identifier: MIT */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

type PatientInsert = typeof Db.patient.$inferInsert;

/**
 * Seeds the database with test patient records.
 */
export async function seedPatients(db: PostgresJsDatabase<typeof Db>) {
  console.log("Seeding patients...");

  // Test patient data with realistic information
  const patients: PatientInsert[] = [
    {
      patId: "PAT001",
      patMrnId: "MRN001234",
      patName: "John Michael Doe",
      patFirstName: "John",
      patLastName: "Doe",
      patMiddleName: "Michael",
      birthDate: new Date("1985-03-15"),
      sexCName: "Male",
      patStatusCName: "Alive",
      city: "Springfield",
      stateCName: "Illinois",
      zip: "62701",
      countryCName: "United States",
      homePhone: "555-123-4567",
      workPhone: "555-987-6543",
      emailAddress: "john.doe@email.com",
      ethnicGroupCName: "Not Hispanic or Latino",
      languageCName: "English",
      religionCName: "Christian",
      intrptrNeededYn: "No",
      advDirectiveYn: "Yes"
    },
    {
      patId: "PAT002",
      patMrnId: "MRN005678",
      patName: "Jane Elizabeth Smith",
      patFirstName: "Jane",
      patLastName: "Smith",
      patMiddleName: "Elizabeth",
      birthDate: new Date("1992-07-22"),
      sexCName: "Female",
      patStatusCName: "Alive",
      city: "Chicago",
      stateCName: "Illinois",
      zip: "60601",
      countryCName: "United States",
      homePhone: "555-234-5678",
      emailAddress: "jane.smith@email.com",
      ethnicGroupCName: "Not Hispanic or Latino",
      languageCName: "English",
      intrptrNeededYn: "No",
      advDirectiveYn: "No"
    },
    {
      patId: "PAT003",
      patMrnId: "MRN009876",
      patName: "Carlos Antonio Rodriguez",
      patFirstName: "Carlos",
      patLastName: "Rodriguez",
      patMiddleName: "Antonio",
      birthDate: new Date("1978-11-08"),
      sexCName: "Male",
      patStatusCName: "Alive",
      city: "Aurora",
      stateCName: "Illinois",
      zip: "60505",
      countryCName: "United States",
      homePhone: "555-345-6789",
      workPhone: "555-876-5432",
      emailAddress: "carlos.rodriguez@email.com",
      ethnicGroupCName: "Hispanic or Latino",
      languageCName: "Spanish",
      religionCName: "Catholic",
      intrptrNeededYn: "Yes",
      advDirectiveYn: "Yes"
    },
    {
      patId: "PAT004",
      patMrnId: "MRN011223",
      patName: "Sarah Marie Johnson",
      patFirstName: "Sarah",
      patLastName: "Johnson",
      patMiddleName: "Marie",
      birthDate: new Date("1965-04-30"),
      sexCName: "Female",
      patStatusCName: "Alive",
      city: "Naperville",
      stateCName: "Illinois",
      zip: "60540",
      countryCName: "United States",
      homePhone: "555-456-7890",
      emailAddress: "sarah.johnson@email.com",
      ethnicGroupCName: "Not Hispanic or Latino",
      languageCName: "English",
      religionCName: "Baptist",
      intrptrNeededYn: "No",
      advDirectiveYn: "Yes"
    },
    {
      patId: "PAT005",
      patMrnId: "MRN033445",
      patName: "Michael Wei Chen",
      patFirstName: "Michael",
      patLastName: "Chen",
      patMiddleName: "Wei",
      birthDate: new Date("1990-12-03"),
      sexCName: "Male",
      patStatusCName: "Alive",
      city: "Schaumburg",
      stateCName: "Illinois",
      zip: "60173",
      countryCName: "United States",
      homePhone: "555-567-8901",
      workPhone: "555-765-4321",
      emailAddress: "michael.chen@email.com",
      ethnicGroupCName: "Not Hispanic or Latino",
      languageCName: "English",
      religionCName: "Buddhist",
      intrptrNeededYn: "No",
      advDirectiveYn: "No"
    }
  ];

  try {
    // Insert patients into the database
    const insertedPatients = await db.insert(Db.patient).values(patients).returning();
    console.log(`Successfully seeded ${insertedPatients.length} patients`);
    return insertedPatients;
  } catch (error) {
    console.error("Error seeding patients:", error);
    throw error;
  }
}