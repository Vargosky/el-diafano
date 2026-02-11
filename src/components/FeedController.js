// src/components/FeedController.js
'use client';

import { useState, useMemo } from 'react';
import StoryCardDiafano from '@/components/StoryCardDiafano';

// Sistema de scoring inteligente
function calcularScore(historia) {
  const ahora = new Date();
  const fechaNoticia = new Date(historia.fecha);
  const horasDesdePublicacion = (ahora - fechaNoticia) / (1000 * 60 * 60);
  
  // 1. PESO POR CANTIDAD DE MEDIOS (factor más importante)
  const pesoMedios = historia.total_noticias * 15;
  
  // 2. FRESCURA TEMPORAL (decaimiento exponencial)
  const pesoFrescura = Math.max(0, 100 * Math.exp(-horasDesdePublicacion / 12));
  
  // 3. PESO POR CATEGORÍA/TAGS
  const pesoCategoria = getPesoPorCategoria(historia.tags);
  
  // 4. BOOST SI ES MUY RECIENTE (menos de 2 horas)
  const boostBreaking = horasDesdePublicacion < 2 ? 30 : 0;
  
  return pesoMedios + pesoFrescura + pesoCategoria + boostBreaking;
}

// Asignar pesos según categoría
function getPesoPorCategoria(tags) {
  if (!tags) return 0;
  
  let tagsStr = '';
  
  if (typeof tags === 'string') {
    tagsStr = tags;
  } else if (Array.isArray(tags)) {
    tagsStr = tags.join(' ');
  } else if (typeof tags === 'object') {
    tagsStr = JSON.stringify(tags);
  }
  
  const tagsLower = tagsStr.toLowerCase();
  
  const pesos = {
    'destacado': 40,
    'urgente': 35,
    'política': 25,
    'economía': 20,
    'internacional': 15,
    'nacional': 15,
    'sociedad': 10,
    'deportes': 5,
    'entretenimiento': 3,
  };
  
  for (const [tag, peso] of Object.entries(pesos)) {
    if (tagsLower.includes(tag)) return peso;
  }
  
  return 0;
}

// Algoritmos de ordenamiento
const sortAlgorithms = {
  score: (stories) => {
    if (!stories || !Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => {
      const scoreA = calcularScore(a);
      const scoreB = calcularScore(b);
      return scoreB - scoreA;
    });
  },
  
  cobertura: (stories) => {
    if (!stories || !Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => {
      if (b.total_noticias !== a.total_noticias) {
        return b.total_noticias - a.total_noticias;
      }
      return new Date(b.fecha) - new Date(a.fecha);
    });
  },
  
  cronologico: (stories) => {
    if (!stories || !Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  },
  
  categoria: (stories) => {
    if (!stories || !Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => {
      const pesoA = getPesoPorCategoria(a.tags);
      const pesoB = getPesoPorCategoria(b.tags);
      if (pesoB !== pesoA) return pesoB - pesoA;
      return b.total_noticias - a.total_noticias;
    });
  },
};

export default function FeedController({ stories = [] }) {
  const [activeView, setActiveView] = useState('score');

  const sortedStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    const sorted = sortAlgorithms[activeView](stories);
    return sorted.slice(0, 15); // Reducido a 15 para el feed central
  }, [stories, activeView]);

  const tabs = [
    { id: 'score', label: '🔥 Top', short: '🔥' },
    { id: 'cobertura', label: '📊 Cobertura', short: '📊' },
    { id: 'cronologico', label: '📅 Recientes', short: '📅' },
    { id: 'categoria', label: '🎯 Categoría', short: '🎯' },
  ];

  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20 opacity-50 italic">
        Conectando con la base de datos...
      </div>
    );
  }

  return (
    <>
      {/* Tabs más compactos */}
      <div className="sticky top-0 z-40 bg-[#f5f2ed] border-b-2 border-[#1a1a1a] py-3 mb-6">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`
                px-3 py-2 text-[10px] md:text-xs font-black uppercase tracking-wide whitespace-nowrap
                transition-all duration-200 font-sans rounded-sm
                ${activeView === tab.id
                  ? 'bg-[#1a1a1a] text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div>
        {sortedStories.map((story, index) => (
          <div key={story.id} className="relative">
            {activeView === 'score' && index < 3 && (
              <div className="absolute -top-2 -left-4 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded font-sans shadow-md">
                {/* #{index + 1} */}
              </div>
            )}
            <StoryCardDiafano story={story} />
          </div>
        ))}
      </div>
    </>
  );
}