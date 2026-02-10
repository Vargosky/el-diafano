// /lib/db.js - CONFIGURACIÓN PARA SUPABASE

import { Pool } from 'pg';
import { fa } from 'zod/locales';

// Configuración del pool de conexiones a Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // Cambia a true si tu base de datos requiere SSL
  max: 20, // Máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Event listeners para debugging (opcional, puedes comentarlos en producción)
pool.on('connect', () => {
  console.log('[DB] ✅ Nueva conexión establecida con Supabase');
});

pool.on('error', (err) => {
  console.error('[DB] ❌ Error inesperado en el pool:', err);
});

export default pool;
