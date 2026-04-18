import mysql from "mysql2/promise";

// Validate required env vars at startup — fail fast with a clear message
const required = ["DB_HOST", "DB_USER", "DB_NAME"] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(
      `Missing environment variable: ${key}\n` +
      `Copy .env.example to .env.local and fill in your database credentials.`
    );
  }
}

export const db = mysql.createPool({
  host:               process.env.DB_HOST,
  port:               Number(process.env.DB_PORT ?? 3306),
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD ?? "",
  database:           process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:    5,
});
