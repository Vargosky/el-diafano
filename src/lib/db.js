import { Pool } from 'pg';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // IMPORTANTE: En local (Docker), SSL suele dar error.
  // Lo comentamos para que entre directo.
  /* ssl: {
    rejectUnauthorized: false
  }
  */
};

// Implementación Singleton para evitar saturar conexiones en desarrollo
export const pool = global.postgresPool || new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  global.postgresPool = pool;
}

export const sql = async (strings, ...values) => {
  const query = strings.reduce((acc, str, i) => 
    acc + str + (values[i] !== undefined ? `$${i + 1}` : ""), "");
  
  return await pool.query(query, values);
};

export default pool;