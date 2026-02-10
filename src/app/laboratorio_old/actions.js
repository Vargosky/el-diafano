'use server';

// Importamos la conexión centralizada desde tu carpeta lib
// El alias '@' apunta a la carpeta 'src' automáticamente en Next.js
import  pool  from '@/lib/db'; 

export async function getLaboratorioData() {
  // Usamos el pool que ya está configurado en db.js
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT 
          lm.id,
          lm.metodo_usado,
          lm.distancia_o_score as score,
          lm.timestamp_prueba,
          -- Datos de la Noticia Nueva (Input)
          n_origen.titulo AS titulo_origen,
          n_origen.medio_nombre_backup AS medio_origen,
          n_origen.imagen_url as img_origen,
          n_origen.id as noticia_input_id,
          -- Datos del Candidato Encontrado (Match)
          n_candidata.titulo AS titulo_candidato,
          n_candidata.medio_nombre_backup AS medio_candidato,
          n_candidata.imagen_url as img_candidato,
          n_candidata.id as historia_candidata_id
      FROM laboratorio_matching lm
      JOIN noticias n_origen ON lm.noticia_input_id = n_origen.id
      LEFT JOIN noticias n_candidata ON lm.historia_candidata_id = n_candidata.id
      ORDER BY lm.timestamp_prueba DESC
      LIMIT 200;
    `;
    
    const res = await client.query(query);
    
    // Serializamos las fechas (Next.js se queja si pasas objetos Date puros del servidor al cliente)
    return res.rows.map(row => ({
      ...row,
      timestamp_prueba: row.timestamp_prueba ? row.timestamp_prueba.toISOString() : null
    }));

  } catch (error) {
    console.error("Error fetching lab data:", error);
    return [];
  } finally {
    // ¡Muy importante! Liberar el cliente para que vuelva al pool
    client.release();
  }
}