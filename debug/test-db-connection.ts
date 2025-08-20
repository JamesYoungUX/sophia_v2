#!/usr/bin/env bun

// Simple database connection test
import postgres from 'postgres';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '../.env.local') });

const DEBUG_LOG = true;

async function testDatabaseConnection() {
  if (DEBUG_LOG) console.log('🔍 Testing database connection...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }
  
  if (DEBUG_LOG) console.log('📍 Database URL found:', databaseUrl.replace(/\/\/[^@]+@/, '//***:***@'));
  
  try {
    // Create postgres client
    const client = postgres(databaseUrl);
    
    if (DEBUG_LOG) console.log('🔌 Attempting to connect to database...');
    
    // Test basic connection with a simple query
    const result = await client`SELECT NOW() as current_time, version() as postgres_version`;
    
    if (DEBUG_LOG) {
      console.log('✅ Database connection successful!');
      console.log('⏰ Current time:', result[0].current_time);
      console.log('🐘 PostgreSQL version:', result[0].postgres_version);
    }
    
    // Test if we can list tables
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (DEBUG_LOG) {
      console.log('📋 Available tables:');
      tables.forEach(table => console.log(`  - ${table.table_name}`));
    }
    
    await client.end();
    console.log('🎉 Database connectivity test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (DEBUG_LOG) console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();