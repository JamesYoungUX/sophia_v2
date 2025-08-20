#!/usr/bin/env bun

import postgres from 'postgres';

const DEBUG_LOG = true;

async function setupExtensions() {
  if (DEBUG_LOG) console.log('🔧 Setting up PostgreSQL extensions...');
  
  const databaseUrl = Bun.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  if (DEBUG_LOG) console.log('📍 Database URL found:', databaseUrl.replace(/\/\/.*@/, '//***:***@'));
  
  // Create postgres client
  const client = postgres(databaseUrl);
  
  try {
    // Execute the extension setup SQL directly
    const sql = 'CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";';
    
    if (DEBUG_LOG) console.log('📄 Executing SQL:', sql);
    
    // Execute the SQL
    await client.unsafe(sql);
    
    if (DEBUG_LOG) console.log('✅ Extensions setup completed successfully!');
    
    // Test that the extension is working
    const result = await client`SELECT uuid_generate_v7() as test_uuid`;
    if (DEBUG_LOG) console.log('🧪 Test UUID generated:', result[0].test_uuid);
    
  } catch (error) {
    console.error('❌ Error setting up extensions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

setupExtensions().catch(console.error);