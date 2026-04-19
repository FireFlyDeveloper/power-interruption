const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: 'aws-1-ap-northeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.uigztqeopcqosocfuyeu',
  password: 'FireFlyDeveloper5736',
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  try {
    await client.connect();
    console.log('Connected to database');

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