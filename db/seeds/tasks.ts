import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { schema as Db } from "../schema";

const DEBUG_LOG = true;

type TaskInsert = typeof Db.taskSpecification.$inferInsert;

const sampleTasks: TaskInsert[] = [
  {
    taskId: 'TASK-001',
    name: 'Pre-operative Assessment',
    category: 'Assessment',
    instructionPatient: 'Complete pre-operative questionnaire and attend assessment appointment',
    instructionClinician: 'Conduct comprehensive pre-operative assessment including medical history review',
    
    // Flattened timing fields
    timingOffsetDays: -7,
    timingDurationDays: 1,
    timingTimeOfDay: '09:00',
    timingIsFlexible: false,
    
    conditions: {
      surgery_types: ['orthopedic', 'cardiac'],
      medications: ['anticoagulants'],
    },
    
    // Flattened evidence fields
    evidenceSource: 'Clinical Guidelines 2024',
    evidenceUrl: 'https://example.com/clinical-guidelines-2024',
    evidenceLevel: 'A',
    evidencePublicationDate: '2024-01-01',
    
    status: 'scheduled',
    priority: 'high',
    versionStatus: 'active',
    version: '1.0.0',
    isTemplate: true,
    
    // Required fields - will be set by the seeding function
    organizationId: '', // Will be filled in
    createdBy: '', // Will be filled in
    updatedBy: '', // Will be filled in
  },
  {
    taskId: 'TASK-002',
    name: 'Post-operative Medication Review',
    category: 'Medication',
    instructionPatient: 'Take prescribed medications as directed and report any side effects',
    instructionClinician: 'Review medication regimen and adjust dosages based on patient response',
    
    timingOffsetDays: 1,
    timingDurationDays: 1,
    timingTimeOfDay: '10:00',
    timingIsFlexible: true,
    
    conditions: {
      surgery_types: ['cardiac'],
      comorbidities: ['diabetes', 'hypertension'],
    },
    
    evidenceSource: 'Medication Management Guidelines',
    evidenceUrl: 'https://example.com/medication-guidelines',
    evidenceLevel: 'B',
    evidencePublicationDate: '2024-02-15',
    
    status: 'pending',
    priority: 'medium',
    versionStatus: 'draft',
    version: '0.1.0',
    isTemplate: false,
    
    organizationId: '',
    createdBy: '',
    updatedBy: '',
  },
  {
    taskId: 'TASK-003',
    name: 'Wound Care Instructions',
    category: 'Education',
    instructionPatient: 'Follow wound care instructions and monitor for signs of infection',
    instructionClinician: 'Provide detailed wound care education and schedule follow-up',
    
    timingOffsetDays: 0,
    timingDurationDays: 14,
    timingTimeOfDay: 'any',
    timingIsFlexible: true,
    
    conditions: {
      surgery_types: ['orthopedic', 'general'],
    },
    
    evidenceSource: 'Wound Care Best Practices 2024',
    evidenceUrl: 'https://example.com/wound-care-practices',
    evidenceLevel: 'B',
    evidencePublicationDate: '2024-03-15',
    
    status: 'completed',
    priority: 'high',
    versionStatus: 'active',
    version: '2.1.0',
    isTemplate: true,
    
    organizationId: '',
    createdBy: '',
    updatedBy: '',
  },
];

export async function seedTasks(db: PostgresJsDatabase<typeof Db>) {
  try {
    if (DEBUG_LOG) console.log('🌱 Starting task seeding...');
    
    // Get first organization and user for required fields
    const [firstOrg] = await db.select().from(Db.organization).limit(1);
    const [firstUser] = await db.select().from(Db.user).limit(1);
    
    if (!firstOrg || !firstUser) {
      console.warn('⚠️ No organization or user found. Skipping task seeding.');
      return [];
    }
    
    if (DEBUG_LOG) console.log(`📋 Using organization: ${firstOrg.name}, user: ${firstUser.name}`);
    
    // Fill in required fields
    const tasksToInsert = sampleTasks.map(task => ({
      ...task,
      organizationId: firstOrg.id,
      createdBy: firstUser.id,
      updatedBy: firstUser.id,
    }));
    
    // Clear existing tasks
    await db.delete(Db.taskSpecification);
    if (DEBUG_LOG) console.log('🗑️ Cleared existing tasks');
    
    // Insert sample tasks
    const insertedTasks = await db.insert(Db.taskSpecification).values(tasksToInsert).returning();
    
    if (DEBUG_LOG) {
      console.log(`✅ Successfully seeded ${insertedTasks.length} tasks:`);
      insertedTasks.forEach((task: any) => {
        console.log(`  - ${task.name} (${task.taskId})`);
      });
    }
    
    return insertedTasks;
  } catch (error) {
    console.error('❌ Error seeding tasks:', error);
    throw error;
  }
}

// This seed function is called from the main seeding script