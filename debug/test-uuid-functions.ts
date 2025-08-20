#!/usr/bin/env bun

import postgres from 'postgres';

const DEBUG_LOG = true;

async function testUuidFunctions() {
  if (DEBUG_LOG) console.log('🧪 Testing UUID functions...');
  
  const databaseUrl = Bun.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  
  const client = postgres(databaseUrl);
  
  try {
    // Test gen_random_uuid() - should be available by default
    if (DEBUG_LOG) console.log('\n1. Testing gen_random_uuid():');
    const randomResult = await client`SELECT gen_random_uuid() as uuid`;
    if (DEBUG_LOG) console.log('✅ gen_random_uuid():', randomResult[0].uuid);
    
    // Test if uuid_generate_v4() is available (from uuid-ossp extension)
    if (DEBUG_LOG) console.log('\n2. Testing uuid_generate_v4():');
    try {
      const v4Result = await client`SELECT uuid_generate_v4() as uuid`;
      if (DEBUG_LOG) console.log('✅ uuid_generate_v4():', v4Result[0].uuid);
    } catch (error) {
      if (DEBUG_LOG) console.log('❌ uuid_generate_v4() not available:', error.message);
    }
    
    // Test if uuid_generate_v7() is available
    if (DEBUG_LOG) console.log('\n3. Testing uuid_generate_v7():');
    try {
      const v7Result = await client`SELECT uuid_generate_v7() as uuid`;
      if (DEBUG_LOG) console.log('✅ uuid_generate_v7():', v7Result[0].uuid);
    } catch (error) {
      if (DEBUG_LOG) console.log('❌ uuid_generate_v7() not available:', error.message);
    }
    
    // Check available extensions
    if (DEBUG_LOG) console.log('\n4. Checking available extensions:');
    const extensions = await client`SELECT name FROM pg_available_extensions WHERE name LIKE '%uuid%' ORDER BY name`;
    if (DEBUG_LOG) console.log('Available UUID extensions:', extensions.map(e => e.name));
    
  } catch (error) {
    console.error('❌ Error testing UUID functions:', error);
    throw error;
  } finally {
    await client.end();
  }
}

testUuidFunctions().catch(console.error);