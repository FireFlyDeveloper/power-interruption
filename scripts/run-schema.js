const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const requiredEnvVars = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'
];

for (const env of requiredEnvVars) {
  if (!process.env[env]) {
    console.error(`❌ Missing required env var: ${env}`);
    console.error('   Set these in your .env file or shell:');
    console.error(`   DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com`);
    console.error(`   DB_PORT=6543`);
    console.error(`   DB_NAME=postgres`);
    console.error(`   DB_USER=postgres.uigztqeopcqosocfuyeu`);
    console.error(`   DB_PASSWORD=your_password`);
    process.exit(1);
  }
}

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT!, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function runSchema() {
  try {
    await client.connect();
    console.log('Connected to database');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    console.log('Running schema.sql...');
    await client.query(schema);

    console.log('Schema created successfully!');
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables created:', res.rows.map(r => r.table_name).join(', '));

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSchema();
