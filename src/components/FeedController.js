// src/components/FeedController.jsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import BiasBar from './BiasBar';

// Normaliza tags
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

export default function FeedController({ stories }) {
  const [activeTab, setActiveTab] = useState('todas');
  
  // Filtrar historias según tab activo
  const filteredStories = stories.filter(story => {
    if (activeTab === 'todas') return true;
    if (activeTab === 'top') return story.peso >= 50;
    if (activeTab === 'recientes') return true;
    return true;
  });

  // Ordenar según tab
  const sortedStories = [...filteredStories].sort((a, b) => {
    if (activeTab === 'top') return b.peso - a.peso;
    if (activeTab === 'recientes') return new Date(b.fecha) - new Date(a.fecha);
    return b.peso - a.peso;
  });

  return (
    <div className="w-full">
      {/* Tabs de navegación */}
      <div className="border-b-2 border-gray-300 mb-8">
        <div className="flex gap-4 font-sans text-xs font-bold uppercase">
          <button
            onClick={() => setActiveTab('todas')}
            className={`pb-2 px-3 transition-colors ${
              activeTab === 'todas' 
                ? 'border-b-4 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('top')}
            className={`pb-2 px-3 transition-colors ${
              activeTab === 'top' 
                ? 'border-b-4 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Top
          </button>
          <button
            onClick={() => setActiveTab('recientes')}
            className={`pb-2 px-3 transition-colors ${
              activeTab === 'recientes' 
                ? 'border-b-4 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Recientes
          </button>
        </div>
      </div>

      {/* Feed de historias */}
      {sortedStories.length > 0 ? (
        sortedStories.map((story) => {
          const tags = normalizeTags(story.tags);

          return (
            <article
              key={story.id}
              className="mb-12 border-b border-gray-200 pb-8 last:border-0"
            >
              {/* Header con ID, tags y contadores */}
              <div className="flex justify-between items-start mb-3">
                {/* Lado izquierdo: ID + Tags */}
                <div className="flex gap-2 flex-wrap items-center">
                  {/* ID de historia - MÁS GRANDE Y VISIBLE */}
                  <span className="bg-blue-600 text-white text-xs font-mono font-black px-2.5 py-1 rounded-sm border-2 border-blue-700">
                    #{story.id}
                  </span>
                  
                  {tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-[10px] font-sans font-bold uppercase px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Contador de artículos y medios */}
                <span className="text-blue-600 font-sans text-[10px] font-bold border border-blue-600 px-2 py-1 rounded whitespace-nowrap">
                  {story.total_noticias} ARTÍCULOS | {story.total_medios} MEDIOS
                </span>
              </div>

              {/* Título */}
              <Link href={`/historia/${story.id}`}>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 hover:text-blue-800 transition-colors cursor-pointer">
                  {story.titulo_generado}
                </h2>
              </Link>

              {/* Resumen */}
              <p className="text-gray-700 leading-relaxed text-md mb-4 line-clamp-3">
                {story.resumen_ia || "Sin resumen disponible."}
              </p>

              {/* BARRA DE SESGO POLÍTICO */}
              <BiasBar 
                izquierda={story.sesgo_izquierda || 0}
                centro_izq={story.sesgo_centro_izq || 0}
                centro={story.sesgo_centro || 0}
                centro_der={story.sesgo_centro_der || 0}
                derecha={story.sesgo_derecha || 0}
                className="mb-4"
              />

              {/* Footer con peso y timestamp */}
              <div className="flex justify-between items-center text-[10px] font-sans text-gray-400 font-bold uppercase">
                {/* Peso de relevancia */}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                  Peso: {story.peso?.toFixed(1) || '0.0'}
                </span>
                
                {/* Timestamp */}
                <span>
                  {story.fecha
                    ? new Date(story.fecha).toLocaleTimeString("es-CL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>
              </div>
            </article>
          );
        })
      ) : (
        <div className="text-center py-20 opacity-50 italic">
          No hay historias para mostrar
        </div>
      )}
    </div>
  );
}