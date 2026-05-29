const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost', port: 3306, user: 'root', password: '020207', database: 'threadshare',
    multipleStatements: true
  });

  let schema = fs.readFileSync('database/schema.sql', 'utf8');

  // Remove CREATE DATABASE and USE statements
  schema = schema.replace(/CREATE DATABASE[\s\S]*?;/, '');
  schema = schema.replace(/USE threadshare;/g, '');

  // Extract DELIMITER blocks (triggers + procedures)
  const delimiterBlocks = [];
  const delimRe = /DELIMITER \$\$([\s\S]*?)DELIMITER ;/g;
  let m;
  while ((m = delimRe.exec(schema)) !== null) {
    // Remove trailing $$
    let block = m[1].trim();
    block = block.replace(/\$\$$/, '').trim();
    delimiterBlocks.push(block);
  }

  // Remove DELIMITER blocks from main schema
  const mainSchema = schema.replace(/DELIMITER \$\$[\s\S]*?DELIMITER ;/g, '');

  // Execute main DDL statements
  const statements = mainSchema.split(';').map(s => s.trim()).filter(s => s.length > 5);
  for (const stmt of statements) {
    try {
      await conn.query(stmt);
    } catch(e) {
      if (!e.message.includes('already exists')) {
        console.error('DDL Error:', e.message.substring(0, 100));
      }
    }
  }
  console.log('Tables and indexes created.');

  // Execute triggers and stored procedures
  for (const block of delimiterBlocks) {
    try {
      await conn.query(block);
      console.log('  OK:', block.substring(0, 60).replace(/\n/g, ' '));
    } catch(e) {
      console.error('  Block Error:', e.message.substring(0, 100));
    }
  }
  console.log('Triggers and procedures done.');

  // Run seed
  let seed = fs.readFileSync('database/seed.sql', 'utf8');
  seed = seed.replace(/USE threadshare;/g, '');
  try {
    await conn.query(seed);
    console.log('Seed data inserted.');
  } catch(e) {
    console.error('Seed error:', e.message.substring(0, 150));
  }

  // Create view separately
  const viewSQL = `CREATE OR REPLACE VIEW v_cost_per_wear AS
    SELECT ii.item_id, ii.user_id, ii.name, ii.brand, ii.purchase_price, ii.wear_count,
      ROUND(ii.purchase_price / NULLIF(ii.wear_count, 0), 2) AS cost_per_wear
    FROM Inventory_Items ii WHERE ii.purchase_price IS NOT NULL`;
  try {
    await conn.query(viewSQL);
    console.log('View created.');
  } catch(e) {
    if (!e.message.includes('already exists')) console.error('View error:', e.message);
  }

  // Verify
  const [tables] = await conn.query('SHOW TABLES');
  console.log('\nTables:', tables.map(t => Object.values(t)[0]).join(', '));

  const [triggers] = await conn.query('SHOW TRIGGERS');
  console.log('Triggers:', triggers.map(t => t.Trigger).join(', '));

  const [procs] = await conn.query("SHOW PROCEDURE STATUS WHERE Db = 'threadshare'");
  console.log('Procedures:', procs.map(p => p.Name).join(', '));

  const [cats] = await conn.query('SELECT COUNT(*) as c FROM Categories');
  const [users] = await conn.query('SELECT COUNT(*) as c FROM Users');
  console.log('Categories:', cats[0].c, '| Users:', users[0].c);

  await conn.end();
  console.log('\nDatabase setup complete!');
})();
