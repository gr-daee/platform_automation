#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * 
 * Purpose: Verify Supabase database connection and test query execution
 * 
 * Usage:
 *   node scripts/verify-db-connection.js
 * 
 * Or with custom credentials:
 *   SUPABASE_DB_HOST=db.example.com SUPABASE_DB_PASSWORD=pass node scripts/verify-db-connection.js
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local if it exists
const envPath = path.resolve(__dirname, '../.env.local');
const envResult = dotenv.config({ path: envPath });

if (envResult.error && !process.env.SUPABASE_DB_HOST) {
  console.warn('⚠️  Warning: .env.local file not found. Using environment variables only.\n');
}

// Validate required environment variables
const requiredVars = {
  SUPABASE_DB_HOST: process.env.SUPABASE_DB_HOST,
  SUPABASE_DB_PASSWORD: process.env.SUPABASE_DB_PASSWORD,
};

const missingVars = Object.entries(requiredVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('\n❌ ===== MISSING REQUIRED ENVIRONMENT VARIABLES =====\n');
  console.error('The following required variables are not set:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Solutions:');
  console.error('   1. Create .env.local file in the project root');
  console.error('   2. Copy .env.example to .env.local and fill in values');
  console.error('   3. Or set environment variables directly:');
  console.error(`      export SUPABASE_DB_HOST=db.example.com`);
  console.error(`      export SUPABASE_DB_PASSWORD=your_password`);
  console.error('\n📖 See ENV_SETUP_GUIDE.md for detailed instructions.\n');
  process.exit(1);
}

// Get database credentials from environment variables only
const dbConfig = {
  host: process.env.SUPABASE_DB_HOST,
  port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection timeout
  connectionTimeoutMillis: 10000,
};

console.log('\n🔍 ===== DATABASE CONNECTION VERIFICATION =====\n');
console.log('📊 Configuration:');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   Port: ${dbConfig.port}`);
console.log(`   Database: ${dbConfig.database}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Password: ${'*'.repeat(dbConfig.password.length)}`);
console.log('');

let pool;

async function verifyConnection() {
  try {
    // Step 1: Create connection pool
    console.log('🔌 Step 1: Creating database connection pool...');
    pool = new Pool(dbConfig);
    
    // Step 2: Test basic connection
    console.log('🧪 Step 2: Testing connection...');
    const connectionTest = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ Connection successful!');
    console.log(`   📅 Server time: ${connectionTest.rows[0].current_time}`);
    console.log(`   🐘 PostgreSQL: ${connectionTest.rows[0].pg_version.split(' ')[0]} ${connectionTest.rows[0].pg_version.split(' ')[1]}`);
    console.log('');
    
    // Step 3: Check if dealer_applications table exists
    console.log('🔍 Step 3: Checking if dealer_applications table exists...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dealer_applications'
      ) as table_exists;
    `);
    
    if (!tableCheck.rows[0].table_exists) {
      console.log('   ⚠️  Table "dealer_applications" not found in public schema');
      console.log('   🔍 Checking other schemas...');
      
      // Check all schemas
      const allTables = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name = 'dealer_applications'
        ORDER BY table_schema;
      `);
      
      if (allTables.rows.length > 0) {
        console.log('   📋 Found in schemas:');
        allTables.rows.forEach(row => {
          console.log(`      - ${row.table_schema}.${row.table_name}`);
        });
        console.log('');
        console.log('   💡 Tip: You may need to use schema-qualified name: schema_name.dealer_applications');
        return;
      } else {
        console.log('   ❌ Table "dealer_applications" not found in any schema');
        console.log('');
        console.log('   📋 Available tables in public schema:');
        const publicTables = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
          LIMIT 20;
        `);
        publicTables.rows.forEach(row => {
          console.log(`      - ${row.table_name}`);
        });
        if (publicTables.rows.length === 20) {
          console.log('      ... (showing first 20)');
        }
        return;
      }
    }
    
    console.log('   ✅ Table "dealer_applications" found!');
    console.log('');
    
    // Step 4: Get table structure
    console.log('📋 Step 4: Getting table structure...');
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'dealer_applications'
      ORDER BY ordinal_position;
    `);
    
    console.log(`   📊 Table has ${columns.rows.length} columns:`);
    columns.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`      - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    });
    console.log('');
    
    // Step 5: Count total records
    console.log('🔢 Step 5: Counting total records...');
    const countResult = await pool.query('SELECT COUNT(*) as total FROM dealer_applications');
    const totalRecords = parseInt(countResult.rows[0].total);
    console.log(`   📊 Total records: ${totalRecords}`);
    console.log('');
    
    // Step 6: Retrieve first 10 records
    console.log('📥 Step 6: Retrieving first 10 records...');
    const records = await pool.query(`
      SELECT * 
      FROM dealer_applications 
      ORDER BY id 
      LIMIT 10;
    `);
    
    if (records.rows.length === 0) {
      console.log('   ⚠️  Table is empty (no records found)');
    } else {
      console.log(`   ✅ Retrieved ${records.rows.length} records:\n`);
      
      // Display records in a readable format
      records.rows.forEach((record, index) => {
        console.log(`   📄 Record ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          // Truncate long values for readability
          let displayValue = value;
          if (typeof value === 'string' && value.length > 50) {
            displayValue = value.substring(0, 50) + '...';
          }
          if (value === null) {
            displayValue = '(null)';
          }
          console.log(`      ${key}: ${displayValue}`);
        });
        console.log('');
      });
    }
    
    // Step 7: Summary
    console.log('✅ ===== VERIFICATION COMPLETE =====');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   ✅ Database connection: SUCCESS`);
    console.log(`   ✅ Table exists: SUCCESS`);
    console.log(`   ✅ Query execution: SUCCESS`);
    console.log(`   📊 Records retrieved: ${records.rows.length} of ${totalRecords} total`);
    console.log('');
    console.log('🎉 All checks passed! Database is ready for testing.');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ ===== VERIFICATION FAILED =====\n');
    console.error('Error details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible issues:');
      console.error('   - Hostname is incorrect');
      console.error('   - Network connectivity problem');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible issues:');
      console.error('   - Port is incorrect');
      console.error('   - Database server is not running');
    } else if (error.code === '28P01') {
      console.error('\n💡 Possible issues:');
      console.error('   - Password is incorrect');
      console.error('   - Username is incorrect');
    } else if (error.code === '3D000') {
      console.error('\n💡 Possible issues:');
      console.error('   - Database name is incorrect');
    } else if (error.code === '42P01') {
      console.error('\n💡 Possible issues:');
      console.error('   - Table does not exist');
      console.error('   - Table name is misspelled');
    }
    
    console.error('');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔒 Database connection closed.');
    }
  }
}

// Run the verification
verifyConnection().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
