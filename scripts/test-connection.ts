/**
 * Database connection test script
 * Run: DATABASE_URL="postgresql://..." npx tsx scripts/test-connection.ts
 */

import process from 'process';

function testConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not set');
    console.log('\nConfigure for Supabase PostgreSQL:');
    console.log(' DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"');
    process.exit(1);
  }

  if (databaseUrl.startsWith('file:') || databaseUrl.includes('.db')) {
    console.error('❌ SQLite detected. Switch to PostgreSQL for production.');
    console.log('\nConfigure for Supabase PostgreSQL:');
    console.log('  DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"');
    process.exit(1);
  }

  if (!databaseUrl.startsWith('postgres')) {
    console.error('❌ Expected PostgreSQL connection string');
    console.log('\nExpected format: postgresql://user:password@host:5432/dbname');
    process.exit(1);
  }

  console.log('✅ Connection string format valid');
  
  const connParts = databaseUrl.match(/postgresql:\/\/([^:]+):[^@]+@([^:]+):(\d+)\/(\w+)/);
  if (connParts) {
    console.log(`   Host: ${connParts[2]}:${connParts[3]}`);
    console.log(`   Database: ${connParts[4]}`);
    console.log(`   User: ${connParts[1]}`);
  }

  console.log('\nNote: Full connection test requires pg package installed');
  console.log('Install: npm install pg @types/pg');
}

testConnection();