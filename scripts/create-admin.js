const { Client } = require('pg');

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

async function createAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', passwordHash);

    await client.query(`
      INSERT INTO users (email, password_hash, display_name, role)
      VALUES ('admin@example.com', $1, 'System Admin', 'admin')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
    `, [passwordHash]);

    console.log('Admin user created/updated: admin@example.com / admin123');

    const res = await client.query('SELECT id, email, role FROM users WHERE email = $1', ['admin@example.com']);
    console.log('User:', res.rows[0]);

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAdmin();
