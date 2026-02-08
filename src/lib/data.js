// ÚNICA IMPORTACIÓN DE POOL - NO AGREGAR MÁS ABAJO
import { pool } from './db';

/**
 * 1. HUB DE HISTORIAS (NUEVO)
 */
export async function getHistoriasHub(search = '', limit = 50) {
  const searchTerm = search ? `%${search}%` : '%';
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        h.id, h.titulo_generado, h.resumen_ia, 
        to_char(h.fecha, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as fecha,
        h.tags,
        (SELECT imagen_url FROM noticias WHERE historia_id = h.id AND imagen_url IS NOT NULL LIMIT 1) as portada,
        json_agg(json_build_object(
          'id', n.id, 'titulo', n.titulo, 'medio', n.medio_nombre_backup, 'link', n.link
        )) as fuentes
      FROM historias h
      LEFT JOIN noticias n ON n.historia_id = h.id
      WHERE h.titulo_generado ILIKE $1 OR h.resumen_ia ILIKE $1
      GROUP BY h.id, h.titulo_generado, h.resumen_ia, h.fecha, h.tags
      ORDER BY h.fecha DESC
      LIMIT $2;
    `, [searchTerm, limit]);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * 2. SEÑAL EN VIVO (NUEVO)
 */
export async function getUltimasNoticias(limit = 10) {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT n.id, n.titulo, n.medio_nombre_backup, 
             to_char(n.created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
             n.link, n.imagen_url 
      FROM noticias n
      ORDER BY n.created_at DESC
      LIMIT $1;
    `, [limit]);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * 3. DASHBOARD (HOME)
 */
export async function getNoticiasParaDashboard() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT n.id, n.titulo, n.created_at, m.nombre as medio_nombre
      FROM noticias n
      LEFT JOIN medios m ON n.medio_id = m.id
      ORDER BY n.created_at DESC
      LIMIT 10;
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * 4. AUDITORÍA DE VECTORES
 */
export async function getAuditoriaVectores() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT id, titulo, historia_id, candidatos_embedding, created_at, medio_nombre_backup
      FROM noticias 
      WHERE created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC 
      LIMIT 50;
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

/**
 * 5. EXPLORADOR DE HISTORIAS
 */
export async function getHistoriasAgrupadas() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        h.id, h.titulo_generado, h.fecha,
        json_agg(json_build_object(
          'id', n.id, 'titulo', n.titulo, 'medio', n.medio_nombre_backup
        )) as noticias
      FROM historias h
      INNER JOIN noticias n ON n.historia_id = h.id
      GROUP BY h.id, h.titulo_generado, h.fecha
      ORDER BY h.fecha DESC;
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

// En tu archivo src/lib/data.js (o donde hagas la query)

export async function getFeedRobusto() {
  // Asumiendo que usas 'sql' de vercel/postgres o similar
  // Si usas otro cliente, adapta solo la llamada a la base de datos.
  
  const result = await sql`
    WITH RankedNews AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY medio_nombre_backup ORDER BY created_at DESC) as rn
        FROM noticias
        WHERE created_at > NOW() - INTERVAL '5 days' -- Optimización: Solo mirar últimos 5 días
    )
    SELECT * FROM RankedNews 
    WHERE rn <= 20 
    ORDER BY created_at DESC;
  `;
  
  return result.rows;
}