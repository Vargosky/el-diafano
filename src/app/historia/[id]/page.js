// src/app/historia/[id]/page.js

import pool from '@/lib/db';
import Link from 'next/link';
import BiasBar from '@/components/BiasBar';

export const dynamic = 'force-dynamic';

// Mapa de colores por sesgo
const SESGO_COLORS = {
  izquierda: { bg: '#D32F2F', text: 'white', border: '#B71C1C' },
  centro_izquierda: { bg: '#FFCDD2', text: '#B71C1C', border: '#EF9A9A' },
  centro: { bg: '#F5F5F5', text: '#424242', border: '#E0E0E0' },
  centro_derecha: { bg: '#BBDEFB', text: '#0D47A1', border: '#90CAF9' },
  derecha: { bg: '#1565C0', text: 'white', border: '#0D47A1' },
};

async function getStoryData(id) {
  try {
    if (!pool) {
      return { story: null, sources: [], sesgos: {} };
    }

    // 1. Historia principal
    const storyRes = await pool.query('SELECT * FROM historias WHERE id = $1', [id]);
    
    if (storyRes.rowCount === 0) {
      return { story: null, sources: [], sesgos: {} };
    }

    const story = storyRes.rows[0];

    // 2. Noticias con datos del medio (incluyendo sesgo)
    const sourcesRes = await pool.query(`
      SELECT 
        n.*,
        m.nombre as medio_nombre,
        m.sesgo_politico
      FROM noticias n
      JOIN medios m ON n.medio_id = m.id
      WHERE n.historia_id = $1 
      ORDER BY n.created_at DESC
    `, [id]);

    // 3. Calcular sesgos para BiasBar
    const sesgos = {
      izquierda: 0,
      centro_izq: 0,
      centro: 0,
      centro_der: 0,
      derecha: 0
    };

    const mediosUnicos = new Set();
    
    sourcesRes.rows.forEach(source => {
      if (source.medio_id && !mediosUnicos.has(source.medio_id)) {
        mediosUnicos.add(source.medio_id);
        const sesgo = source.sesgo_politico;
        
        if (sesgo === 'izquierda') sesgos.izquierda++;
        else if (sesgo === 'centro_izquierda' || sesgo === 'centro-izquierda') sesgos.centro_izq++;
        else if (sesgo === 'centro') sesgos.centro++;
        else if (sesgo === 'centro_derecha' || sesgo === 'centro-derecha') sesgos.centro_der++;
        else if (sesgo === 'derecha') sesgos.derecha++;
      }
    });
    
    return {
      story: story,
      sources: sourcesRes.rows,
      sesgos
    };
  } catch (error) {
    console.error("[ERROR] Error en BD:", error.message);
    return { story: null, sources: [], sesgos: {} };
  }
}

export default async function StoryPage({ params }) {
  const { id } = await params;
  const { story, sources, sesgos } = await getStoryData(id);

  if (!story) {
    return (
      <div className="min-h-screen bg-[#f7f4ed] p-20 text-center font-sans">
        <h1 className="text-xl font-bold text-red-600">Historia no encontrada</h1>
        <p className="text-gray-500 mt-4 mb-8">El ID {id} no existe en la base de datos.</p>
        <Link href="/" className="text-blue-600 underline font-black uppercase text-xs">
          ← Volver a la portada
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b] pb-20">
      {/* Cabecera */}
      <header className="max-w-4xl mx-auto pt-12 px-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
            ← Portada El Diáfano
          </Link>
          
          {/* ID de historia */}
          <span className="bg-gray-800 text-white text-[9px] font-mono font-bold px-2 py-1 rounded">
            Historia #{id}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold mt-6 leading-tight tracking-tight text-gray-900">
          {story.titulo_generado}
        </h1>

        {/* Síntesis IA */}
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

        {/* BARRA DE SESGO */}
        <div className="mt-6">
          <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
            Cobertura por Sesgo Político
          </h3>
          <BiasBar 
            izquierda={sesgos.izquierda}
            centro_izq={sesgos.centro_izq}
            centro={sesgos.centro}
            centro_der={sesgos.centro_der}
            derecha={sesgos.derecha}
          />
        </div>
      </header>

      {/* Fuentes */}
      <main className="max-w-4xl mx-auto mt-12 px-6">
        <div className="flex justify-between items-end border-b border-[#e6e2d9] pb-2 mb-8">
          <h2 className="text-xs font-black uppercase tracking-widest text-[#65615a]">
            Fuentes Contrastadas ({sources.length})
          </h2>
        </div>

        <div className="grid gap-6">
          {sources.length > 0 ? (
            sources.map((source) => {
              const sesgo = source.sesgo_politico || 'centro';
              const sesgoKey = sesgo.replace('-', '_'); // centro-izquierda → centro_izquierda
              const colors = SESGO_COLORS[sesgoKey] || SESGO_COLORS.centro;

              return (
                <a 
                  key={source.id} 
                  href={source.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-6 bg-[#fdfcfb] border border-[#e6e2d9] hover:border-blue-300 transition-all group"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {/* Badge del medio con color dinámico */}
                      <span 
                        className="text-[10px] font-black uppercase px-2 py-1 rounded border"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border
                        }}
                      >
                        {source.medio_nombre || 'Medio Nacional'}
                      </span>
                      
                      {/* IDs de debug */}
                      <span className="bg-gray-200 text-gray-600 text-[8px] font-mono px-1.5 py-0.5 rounded">
                        N:{source.id}
                      </span>
                      <span className="bg-gray-200 text-gray-600 text-[8px] font-mono px-1.5 py-0.5 rounded">
                        M:{source.medio_id}
                      </span>
                    </div>
                    
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
                    {source.resumen_ia || "Haga clic para leer la cobertura completa."}
                  </p>

                  <div className="mt-4 flex justify-end">
                    <span className="text-[9px] font-bold uppercase text-gray-300 group-hover:text-blue-400 transition-colors">
                      Leer más en la fuente →
                    </span>
                  </div>
                </a>
              );
            })
          ) : (
            <p className="text-center py-10 italic text-gray-400">
              No se encontraron noticias asociadas.
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