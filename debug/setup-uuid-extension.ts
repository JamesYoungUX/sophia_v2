#!/usr/bin/env bun

import postgres from 'postgres';

const DEBUG_LOG = true;

async function setupUuidExtension() {
  if (DEBUG_LOG) console.log('🔧 Setting up UUID extension...');
  
  const databaseUrl = Bun.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  if (DEBUG_LOG) console.log('📍 Database URL found:', databaseUrl.replace(/\/\/.*@/, '//***:***@'));
  
  const client = postgres(databaseUrl);
  
  try {
    // Install uuid-ossp extension for uuid_generate_v4()
    const sql = 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";';
    
    if (DEBUG_LOG) console.log('📄 Executing SQL:', sql);
    
    await client.unsafe(sql);
    
    if (DEBUG_LOG) console.log('✅ UUID extension setup completed successfully!');
    
    // Test that uuid_generate_v4() is now working
    const result = await client`SELECT uuid_generate_v4() as test_uuid`;
    if (DEBUG_LOG) console.log('🧪 Test UUID v4 generated:', result[0].test_uuid);
    
    // Also test gen_random_uuid() which we'll use instead
    const randomResult = await client`SELECT gen_random_uuid() as test_uuid`;
    if (DEBUG_LOG) console.log('🧪 Test random UUID generated:', randomResult[0].test_uuid);
    
  } catch (error) {
    console.error('❌ Error setting up UUID extension:', error);
    throw error;
  } finally {
    await client.end();
  }
}

setupUuidExtension().catch(console.error);