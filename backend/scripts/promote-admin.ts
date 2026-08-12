import 'dotenv/config';
import { Client } from 'pg';

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run make-admin -- <email>');
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const result = await client.query(
      `UPDATE users SET role = 'ADMIN' WHERE email = $1 RETURNING email`,
      [email.toLowerCase()],
    );
    if (result.rowCount === 0) {
      console.error(`No user found with email ${email}`);
      process.exit(1);
    }
    console.log(`${result.rows[0].email} is now ADMIN.`);
  } finally {
    await client.end();
  }
}

void main();
