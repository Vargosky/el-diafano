import { Pool } from 'pg';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};

// Implementación Singleton para evitar saturar conexiones en desarrollo
export const pool = global.postgresPool || new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') {
  global.postgresPool = pool;
}

/**
 * Función 'sql' puente para Tagged Templates
 * Es vital si tus funciones en data.js la utilizan
 */
export const sql = async (strings, ...values) => {
  const query = strings.reduce((acc, str, i) => 
    acc + str + (values[i] !== undefined ? `$${i + 1}` : ""), "");
  
  return await pool.query(query, values);
};

// Mantenemos el export default por si otros archivos lo usan así
export default pool;