import "server-only";
import { Pool } from "pg";

const isProd = process.env.NODE_ENV === "production";

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = global.postgresPool || new Pool(poolConfig);

if (!isProd) global.postgresPool = pool;

export default pool;
export { pool };
