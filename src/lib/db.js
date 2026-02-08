// import { Pool } from 'pg';

// /**
//  * Configuración de conexión para tu base de datos local
//  * Usuario: n8n_user (creado para el flujo de automatización)
//  */
// const poolConfig = {
//   user: 'n8n_user',
//   host: 'localhost',
//   database: 'ground_news_db',
//   password: 'mi_password_segura_123', // Tu clave definida en el servidor
//   port: 5432,
//   // Configuraciones de optimización para el Pool
//   max: 20, // Máximo de conexiones simultáneas
//   idleTimeoutMillis: 30000, // Cierra conexiones inactivas tras 30s
//   connectionTimeoutMillis: 2000, // Tiempo límite para conectar
// };

// /**
//  * Implementación Singleton para Next.js (Node.js)
// //  * En desarrollo, Next.js recarga los módulos constantemente. 
//  * Guardar el pool en 'global' evita saturar el socket de Postgres.
//  */
// export const pool = global.pgPool || new Pool(poolConfig);

// if (process.env.NODE_ENV !== 'production') {
//   global.pgPool = pool;
// }

// /**
//  * Función 'sql' puente: permite usar Tagged Templates en data.js
//  * Ejemplo: await sql`SELECT * FROM noticias WHERE id = ${id}`
//  */
// export const sql = async (strings, ...values) => {
//   // Convierte el template literal en una query parametrizada ($1, $2, etc.)
//   const query = strings.reduce((acc, str, i) => 
//     acc + str + (values[i] !== undefined ? `$${i + 1}` : ""), "");
  
//   return await pool.query(query, values);
// };


// src/lib/db.js


//nueva config para remoto db

import { Pool } from 'pg';

// Usamos el objeto global para evitar que Next.js 
// intente re-declarar el pool en cada recarga.
const pool = global.postgresPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

if (process.env.NODE_ENV !== 'production') {
  global.postgresPool = pool;
}

export default pool;