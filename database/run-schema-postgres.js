const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const { Client } = require('pg');
const fs = require('fs');

(async () => {
  const connectionString = process.env.DATABASE_URL || process.argv[2];
  if (!connectionString) {
    console.error('Error: Please provide a database connection string.');
    console.error('Usage: node database/run-schema-postgres.js <DATABASE_URL>');
    console.error('Or set the DATABASE_URL environment variable.');
    process.exit(1);
  }

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase / hosted databases
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading schema_postgres.sql...');
    const schema = fs.readFileSync('database/schema_postgres.sql', 'utf8');

    console.log('Executing schema DDL...');
    await client.query(schema);
    console.log('Schema, indexes, triggers, and procedures created successfully.');

    console.log('Reading seed_postgres.sql...');
    const seed = fs.readFileSync('database/seed_postgres.sql', 'utf8');

    console.log('Executing seed data insert...');
    await client.query(seed);
    console.log('Seed data inserted successfully.');

    console.log('\nDatabase initialization on Supabase complete!');
  } catch (err) {
    console.error('\nDatabase migration failed:');
    console.error(err.message || err);
  } finally {
    await client.end();
  }
})();
