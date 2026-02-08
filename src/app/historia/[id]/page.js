import pool from '@/lib/db';
import Link from 'next/link';

// Forzamos a que no use cache para ver cambios en tiempo real durante el debug
export const dynamic = 'force-dynamic';

async function getStoryData(id) {
  console.log(`[DEBUG] Iniciando búsqueda para Historia ID: ${id}`);
  
  try {
    // Verificamos si el pool existe
    if (!pool) {
      console.error("[DEBUG] ERROR: El objeto pool no está definido. Revisa src/lib/db.js");
      return { story: null, sources: [] };
    }

    // 1. Buscamos la historia
    const storyRes = await pool.query('SELECT * FROM historias WHERE id = $1', [id]);
    console.log(`[DEBUG] Historias encontradas: ${storyRes.rowCount}`);

    if (storyRes.rowCount === 0) {
      console.warn(`[DEBUG] No se encontró ninguna fila en la tabla 'historias' con ID: ${id}`);
      return { story: null, sources: [] };
    }

    const story = storyRes.rows[0];
    console.log(`[DEBUG] Historia recuperada con éxito: "${story.titulo_generado}"`);

    // 2. Buscamos las fuentes relacionadas
    const sourcesRes = await pool.query(
      'SELECT * FROM noticias WHERE historia_id = $1 ORDER BY fecha DESC', 
      [id]
    );
    console.log(`[DEBUG] Fuentes relacionadas encontradas: ${sourcesRes.rowCount}`);

    return {
      story: story,
      sources: sourcesRes.rows
    };

  } catch (error) {
    console.error("[DEBUG] EXCEPCIÓN capturada en getStoryData:");
    console.error(`- Mensaje: ${error.message}`);
    console.error(`- Código: ${error.code}`); // Útil para errores de Postgres (ej: 42P01 si la tabla no existe)
    return { story: null, sources: [] };
  }
}

export default async function StoryPage({ params }) {
  const { id } = await params;
  const { story, sources } = await getStoryData(id);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] p-20 text-center font-sans">
        <h1 className="text-xl font-bold italic text-gray-400 mb-2">Debug Mode: Activo</h1>
        <h2 className="text-2xl font-black text-red-600">Historia no encontrada</h2>
        <p className="text-gray-500 mt-4 max-w-md mx-auto">
          El ID <span className="font-mono bg-gray-200 px-1">{id}</span> no devolvió resultados. 
          Revisa los Runtime Logs en Vercel para ver el error de la base de datos.
        </p>
        <Link href="/" className="text-blue-600 underline font-bold mt-8 block uppercase text-xs">
          ← Volver al Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b] pb-20">
      {/* ... Resto de tu código de renderizado (se mantiene igual) ... */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
          ← Portada El Diáfano
        </Link>
        <h1 className="text-4xl font-serif font-extrabold mt-6 leading-tight tracking-tight text-gray-900">
          {story.titulo_generado}
        </h1>
        {/* ... etc ... */}
      </header>
      {/* ... main sources loop ... */}
    </div>
  );
}