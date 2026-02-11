import pool from '@/lib/db';
import Link from 'next/link';

// Forzamos que no use caché para evitar que veas datos viejos durante las pruebas
export const dynamic = 'force-dynamic';

async function getStoryData(id) {
  console.log(`[DEBUG] Iniciando búsqueda para Historia ID: ${id}`);
  
  try {
    if (!pool) {
      console.error("[DEBUG] ERROR: El objeto pool no está definido.");
      return { story: null, sources: [] };
    }

    // 1. Obtenemos la historia principal
    const storyRes = await pool.query('SELECT * FROM historias WHERE id = $1', [id]);
    console.log(`[DEBUG] Historias encontradas: ${storyRes.rowCount}`);

    if (storyRes.rowCount === 0) {
      return { story: null, sources: [] };
    }

    const story = storyRes.rows[0];

    // 2. Obtenemos las noticias relacionadas
    // IMPORTANTE: Usamos 'created_at' porque 'fecha' no existe en tu tabla de Supabase
    const sourcesRes = await pool.query(
      'SELECT * FROM noticias WHERE historia_id = $1 ORDER BY created_at DESC', 
      [id]
    );
    console.log(`[DEBUG] Noticias relacionadas encontradas: ${sourcesRes.rowCount}`);
    
    return {
      story: story,
      sources: sourcesRes.rows
    };
  } catch (error) {
    console.error("[DEBUG] Error en la base de datos:", error.message);
    return { story: null, sources: [] };
  }
}

export default async function StoryPage({ params }) {
  // En Next.js 15, params es una promesa que debe ser esperada
  const { id } = await params;
  const { story, sources } = await getStoryData(id);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] p-20 text-center font-sans">
        <h1 className="text-xl font-bold text-red-600">Historia no encontrada</h1>
        <p className="text-gray-500 mt-4 mb-8">El ID {id} no existe en la base de datos remota.</p>
        <Link href="/" className="text-blue-600 underline font-black uppercase text-xs">
          ← Volver a la portada
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b] pb-20">
      {/* Cabecera Estilo Diario */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
          ← Portada El Diáfano
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold mt-6 leading-tight tracking-tight text-gray-900">
          {story.titulo_generado}
        </h1>

        {/* Caja de Síntesis IA */}
        <div className="mt-8 p-6 bg-[#fdfcfb] border border-[#e6e2d9] rounded-sm shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              SÍNTESIS INTELIGENCIA ARTIFICIAL
            </h3>
          </div>
          <p className="text-xl leading-relaxed text-gray-700 italic font-serif">
            {story.resumen_ia || "Generando análisis de consenso..."}
          </p>
        </div>
      </header>

      {/* Listado de Fuentes Comparadas */}
      <main className="max-w-4xl mx-auto mt-12 px-6">
        <div className="flex justify-between items-end border-b border-[#e6e2d9] pb-2 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#65615a]">
            Fuentes Contrastadas ({sources.length})
          </h2>
        </div>

        <div className="grid gap-6">
          {sources.length > 0 ? (
            sources.map((source) => (
              <a 
                key={source.id} 
                href={source.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block p-6 bg-[#fdfcfb] border border-[#e6e2d9] hover:border-blue-300 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase text-blue-600 px-2 py-1 bg-blue-50 rounded">
                    {/* Mapeo de medios según tu base de datos */}
                    {source.medio_id === 1 ? 'BioBio Chile' : 
                     source.medio_id === 3 ? 'Emol' : 
                     source.medio_id === 40 ? 'Cooperativa' : 
                     source.medio_id === 6 ? 'El Siglo' : 'Medio Nacional'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(source.created_at).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <h4 className="text-xl font-bold group-hover:text-blue-800 leading-snug mb-3">
                  {source.titulo}
                </h4>
                
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">
                  {source.resumen_ia || "Haga clic para leer la cobertura completa en el medio original."}
                </p>

                <div className="mt-4 flex justify-end">
                  <span className="text-[9px] font-bold uppercase text-gray-300 group-hover:text-blue-400 transition-colors">
                    Leer más en la fuente →
                  </span>
                </div>
              </a>
            ))
          ) : (
            <p className="text-center py-10 italic text-gray-400">
              No se encontraron cables de noticias asociados a esta historia.
            </p>
          )}
        </div>
      </main>

      <footer className="mt-20 text-center py-10 border-t border-[#e6e2d9]">
        <p className="text-[10px] text-[#a39e93] uppercase tracking-[0.3em]">
          Einsoft Intelligence Unit • Valparaíso, Chile
        </p>
      </footer>
    </div>
  );
}