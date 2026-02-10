import pool from "@/lib/db";
import React from "react";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normaliza tags en caso de que Postgres devuelva array o string tipo "{POLITICA,ECONOMIA}"
const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;

  if (typeof tags === "string") {
    return tags
      .replace(/[{}"]/g, "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
};

async function getStories() {
  try {
    const query = `
      SELECT 
        h.id, 
        h.titulo_generado, 
        h.fecha, 
        h.tags, 
        h.resumen_ia, 
        h.categoria_ia, 
        COALESCE(h.peso_relevancia, 0) as peso,
        (SELECT COUNT(*) FROM noticias n WHERE n.historia_id = h.id) as total_noticias,
        (SELECT COUNT(DISTINCT medio_id) FROM noticias n WHERE n.historia_id = h.id) as total_medios
      FROM historias h
      WHERE h.estado = 'activo'
      ORDER BY h.fecha DESC, h.peso_relevancia DESC
      LIMIT 20
    `;

    const res = await pool.query(query);

    // Soporta distintos wrappers
    const rows =
      Array.isArray(res) ? res :
      Array.isArray(res?.rows) ? res.rows :
      Array.isArray(res?.data) ? res.data :
      Array.isArray(res?.result?.rows) ? res.result.rows :
      [];

    return rows;
  } catch (error) {
    console.error("Error al obtener historias:", error);
    return [];
  }
}

export default async function ElDiafanoPage() {
  const storiesRaw = await getStories();
  const stories = Array.isArray(storiesRaw) ? storiesRaw : [];

  const fechaActual = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Bloques laterales
  const economiaStories = stories
    .filter((s) => s.categoria_ia === "Economía")
    .slice(0, 3);

  const lateralIzquierdo =
    economiaStories.length > 0 ? economiaStories : stories.slice(10, 13);

  const lateralDerecho = stories.slice(5, 10);

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-serif p-4 md:p-8">
      {/* Header Estilo Periódico */}
      <header className="max-w-6xl mx-auto text-center border-b-4 border-[#1a1a1a] mb-12 pb-6">
        <div className="flex justify-between items-center mb-4 text-xs font-sans font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            LIVE FEED • EINSOFT INTELLIGENCE
          </span>
          <span>Versión Alpha 1.0</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-2 tracking-tighter text-center">
          EL <span className="text-blue-600">DIÁFANO</span>
        </h1>

        <p className="italic text-xl text-gray-600 mb-4">
          Crónica de Consensos
        </p>

        <div className="flex justify-center border-t border-gray-300 pt-2 text-sm font-sans uppercase">
          <span>Valparaíso, Chile • {fechaActual}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Columna Lateral Izquierda */}
        <aside className="md:col-span-3 border-r border-gray-300 pr-4 hidden md:block">
          <h2 className="bg-[#1a1a1a] text-white text-center py-1 text-xs font-bold uppercase mb-4">
            Destacados
          </h2>

          {lateralIzquierdo.map((story) => (
            <div key={story.id} className="mb-6 border-b border-gray-200 pb-4">
              <Link href={`/historia/${story.id}`}>
                <h3 className="font-bold text-md leading-tight hover:text-blue-700 transition-colors cursor-pointer">
                  {story.titulo_generado}
                </h3>
              </Link>

              <p className="text-xs text-gray-500 mt-1 uppercase font-sans">
                {story.total_medios} medios
              </p>
            </div>
          ))}
        </aside>

        {/* Feed Central */}
        <section className="md:col-span-6">
          {stories.length > 0 ? (
            stories.slice(0, 5).map((story) => {
              const tags = normalizeTags(story.tags);

              return (
                <article
                  key={story.id}
                  className="mb-12 border-b border-gray-200 pb-8 last:border-0"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-2 flex-wrap">
                      {tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="bg-gray-200 text-[10px] font-sans font-bold uppercase px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-blue-600 font-sans text-[10px] font-bold border border-blue-600 px-2 py-1 rounded whitespace-nowrap">
                      {story.total_noticias} ARTÍCULOS | {story.total_medios} MEDIOS
                    </span>
                  </div>

                  <Link href={`/historia/${story.id}`}>
                    <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 hover:text-blue-800 transition-colors cursor-pointer">
                      {story.titulo_generado}
                    </h2>
                  </Link>

                  <p className="text-gray-700 leading-relaxed text-md mb-4 line-clamp-3">
                    {story.resumen_ia || "Sin resumen disponible."}
                  </p>

                  <div className="flex justify-end text-[10px] font-sans text-gray-400 font-bold uppercase">
                    {story.fecha
                      ? new Date(story.fecha).toLocaleTimeString("es-CL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="text-center py-20 opacity-50 italic">
              Conectando con la base de datos...
            </div>
          )}
        </section>

        {/* Columna Lateral Derecha */}
        <aside className="md:col-span-3 border-l border-gray-300 pl-4">
          <h2 className="bg-blue-600 text-white text-center py-1 text-xs font-bold uppercase mb-4">
            Política & Sociedad
          </h2>

          {lateralDerecho.map((story) => (
            <div key={story.id} className="mb-6 border-b border-gray-100 pb-4">
              <Link href={`/historia/${story.id}`}>
                <h3 className="font-bold text-sm leading-snug hover:text-blue-700 transition-colors cursor-pointer">
                  {story.titulo_generado}
                </h3>
              </Link>

              <p className="text-[10px] text-gray-400 mt-2 font-sans line-clamp-2">
                {story.resumen_ia || "Sin resumen disponible."}
              </p>
            </div>
          ))}
        </aside>
      </main>
    </div>
  );
}
