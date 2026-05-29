import { Pool, PoolClient, QueryResult } from "pg";

// Validate required env vars at startup
if (!process.env.DATABASE_URL) {
  throw new Error(
    "Missing environment variable: DATABASE_URL\n" +
    "Please check your .env.local file."
  );
}

// Initialize the PostgreSQL Connection Pool (Singleton pattern for Dev)
const globalForPool = global as unknown as { pool: Pool };

const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase / hosted databases
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

// Helper to convert MySQL SQL syntax to PostgreSQL compatible syntax
function convertQuery(sql: string): string {
  let index = 1;
  // Replace ? with $1, $2, etc.
  let converted = sql.replace(/\?/g, () => `$${index++}`);
  
  // Translate CURDATE() to CURRENT_DATE
  converted = converted.replace(/CURDATE\(\)/gi, "CURRENT_DATE");
  
  return converted;
}

// Helper to inject RETURNING clause for INSERT queries to emulate mysql2's insertId
function injectReturning(sql: string): string {
  const trimmed = sql.trim();
  if (/^insert\s+/i.test(trimmed) && !/returning\s+/i.test(trimmed)) {
    return `${trimmed} RETURNING *`;
  }
  return sql;
}

// Helper to extract the auto-increment ID from a RETURNING result row
function getInsertId(rows: any[]): number | null {
  if (!rows || rows.length === 0) return null;
  const row = rows[0];
  // Find a key ending with _id or named exactly id
  const idKey = Object.keys(row).find(
    k => k.toLowerCase().endsWith("_id") || k.toLowerCase() === "id"
  );
  if (idKey) {
    return Number(row[idKey]);
  }
  // Fallback to the first value in the row
  return Number(Object.values(row)[0]);
}

// Wrapper around pg QueryResult to mimic mysql2's execute response format
function wrapResult(res: QueryResult<any>, isInsert: boolean) {
  const mockResult = isInsert
    ? { insertId: getInsertId(res.rows), affectedRows: res.rowCount }
    : res.rows; // Standard queries return rows directly as the first array element in mysql2 destructuring
  return [mockResult, res.fields];
}

// The MySQL-compatible database interface
export const db = {
  // Execute direct query on the pool
  async execute(sql: string, params?: any[]) {
    const isInsert = /^insert\s+/i.test(sql.trim());
    const pgSql = convertQuery(isInsert ? injectReturning(sql) : sql);
    const res = await pool.query(pgSql, params);
    return wrapResult(res, isInsert);
  },

  // Get a pooled connection (mocked client connection)
  async getConnection() {
    const client = await pool.connect();
    
    return {
      async beginTransaction() {
        await client.query("BEGIN");
      },
      
      async execute(sql: string, params?: any[]) {
        const isInsert = /^insert\s+/i.test(sql.trim());
        const pgSql = convertQuery(isInsert ? injectReturning(sql) : sql);
        const res = await client.query(pgSql, params);
        return wrapResult(res, isInsert);
      },
      
      async commit() {
        await client.query("COMMIT");
      },
      
      async rollback() {
        await client.query("ROLLBACK");
      },
      
      release() {
        client.release();
      }
    };
  },
  
  // Expose the raw pool for native pg queries if ever needed
  pool
};
