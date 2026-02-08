import { Pool } from 'pg';
import Link from 'next/link';

// Configuración de conexión con tus credenciales de respaldo
const pool = new Pool({
  user: 'n8n_user',
  host: 'localhost',
  database: 'ground_news_db',
  password: 'mi_password_segura_123',
  port: 5432,
});

async function getStoryData(id) {
  try {
    // 1. Obtenemos la historia principal
    const storyRes = await pool.query('SELECT * FROM historias WHERE id = $1', [id]);
    
    // 2. Obtenemos las noticias relacionadas usando el nombre de columna correcto: created_at
    const sourcesRes = await pool.query(
      'SELECT * FROM noticias WHERE historia_id = $1 ORDER BY created_at DESC', 
      [id]
    );
    
    return {
      story: storyRes.rows[0],
      sources: sourcesRes.rows
    };
  } catch (error) {
    console.error("Error en detalle de Einsoft:", error.message);
    return { story: null, sources: [] };
  }
}

export default async function StoryPage({ params }) {
  const { id } = await params;
  const { story, sources } = await getStoryData(id);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] p-20 text-center font-sans">
        <h1 className="text-xl font-bold">Historia no encontrada</h1>
        <Link href="/" className="text-blue-600 underline mt-4 block">Volver a la portada</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b] pb-20">
      {/* Cabecera */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <Link href="/" className="text-xs font-black text-blue-600 uppercase tracking-tighter hover:underline">
          ← Portada El Diáfano
        </Link>
        
        <h1 className="text-4xl font-serif font-extrabold mt-6 leading-tight tracking-tight text-gray-900">
          {story.titulo_generado}
        </h1>

        {/* Caja de Resumen IA (Color Hueso) */}
        <div className="mt-8 p-6 bg-[#fdfcfb] border border-[#e6e2d9] rounded-sm shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
              SÍNTESIS INTELIGENCIA ARTIFICIAL
            </h3>
          </div>
          <p className="text-lg leading-relaxed text-gray-700 italic">
            {story.resumen_ia || "Analizando cables de noticias para generar un resumen ejecutivo..."}
          </p>
        </div>
      </header>

      {/* Listado de Fuentes */}
      <main className="max-w-4xl mx-auto mt-12 px-6">
        <div className="flex justify-between items-end border-b border-[#e6e2d9] pb-2 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#65615a]">
            Fuentes de Información ({sources.length})
          </h2>
        </div>

        <div className="grid gap-4">
          {sources.map((source) => (
            <a 
              key={source.id} 
              href={source.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-5 bg-[#fdfcfb] border border-[#e6e2d9] hover:border-blue-300 transition-all group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-blue-600">
                  {/* Aquí podrías mapear el medio_id a un nombre real */}
                  {source.medio_id === 1 ? 'BioBio Chile' : source.medio_id === 2 ? 'Emol' : 'Medio Nacional'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(source.created_at).toLocaleDateString('es-CL')}
                </span>
              </div>
              <h4 className="text-lg font-bold group-hover:text-blue-800 leading-snug">
                {source.titulo}
              </h4>
              <div className="mt-2 text-xs text-gray-500 line-clamp-2">
                {source.resumen_ia || "Ver noticia completa en la fuente original."}
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="mt-20 text-center py-10 border-t border-[#e6e2d9]">
        <p className="text-[10px] text-[#a39e93] uppercase tracking-[0.3em]">Einsoft Intelligence Unit</p>
      </footer>
    </div>
  );
}