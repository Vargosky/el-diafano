// src/app/page.js

// ⭐ CRÍTICO: Configuración para evitar caché
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import FeedController from '@/components/FeedController';
import SidebarSection from '@/components/SidebarSection';
import LiveFeedIndicator from '@/components/LiveFeedIndicator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// src/app/page.js

async function getStories() {
  try {
    const { data, error } = await supabase.rpc('get_stories_with_bias', {
      dias_atras: 7,
      limite: 100
    });

    if (error) {
      console.error('Error RPC:', error);
      throw error;
    }

    // Los datos ya vienen con sesgos calculados desde la BD
    const stories = data?.map(story => ({
      id: story.id,
      titulo_generado: story.titulo_generado,
      fecha: story.fecha,
      tags: story.tags,
      resumen_ia: story.resumen_ia,
      categoria_ia: story.categoria_ia,
      peso: story.peso_relevancia || 0,
      total_noticias: story.total_noticias,
      total_medios: story.total_medios,
      // Sesgos ya calculados en BD
      sesgo_izquierda: story.sesgo_izquierda,
      sesgo_centro_izq: story.sesgo_centro_izq,
      sesgo_centro: story.sesgo_centro,
      sesgo_centro_der: story.sesgo_centro_der,
      sesgo_derecha: story.sesgo_derecha,
    })) || [];

    return stories;
  } catch (error) {
    console.error('Error al obtener historias:', error);
    return [];
  }
}

async function getLastUpdate() {
  try {
    const { data, error } = await supabase
      .from('historias')
      .select('fecha')
      .eq('estado', 'activo')
      .order('fecha', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.fecha || new Date().toISOString();
  } catch (error) {
    console.error('Error al obtener última actualización:', error);
    return new Date().toISOString();
  }
}

export default async function ElDiafanoPage() {
  const stories = await getStories();
  const lastUpdate = await getLastUpdate();

  const fechaActual = new Date().toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Separar historias por categoría para las columnas laterales
  const economiaStories = stories
    .filter((s) => s.categoria_ia === "Economía")
    .slice(0, 5);

  const politicaStories = stories
    .filter((s) => s.categoria_ia === "Política" || s.tags?.includes?.("política") || s.tags?.includes?.("POLITICA"))
    .slice(0, 5);

  const internacionalStories = stories
    .filter((s) => s.categoria_ia === "Internacional")
    .slice(0, 4);

  const sociedadStories = stories
    .filter((s) => s.categoria_ia === "Sociedad")
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-serif">
      {/* Header Estilo Periódico */}
      <header className="max-w-7xl mx-auto text-center border-b-4 border-[#1a1a1a] mb-8 pb-6 px-4 md:px-8 pt-8">
        <div className="flex justify-between items-center mb-4 text-xs font-sans font-bold uppercase tracking-widest">
          <LiveFeedIndicator lastUpdate={lastUpdate} />
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

      {/* Layout 3 Columnas */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Columna Lateral Izquierda - Economía */}
        <aside className="md:col-span-3 space-y-6 hidden md:block">
          <SidebarSection 
            title="Economía" 
            color="bg-green-700"
            stories={economiaStories}
          />
          
          <SidebarSection 
            title="Internacional" 
            color="bg-purple-700"
            stories={internacionalStories}
          />
        </aside>

        {/* Feed Central con Tabs */}
        <section className="md:col-span-6">
          <FeedController stories={stories} />
        </section>

        {/* Columna Lateral Derecha - Política & Sociedad */}
        <aside className="md:col-span-3 space-y-6">
          <SidebarSection 
            title="Política" 
            color="bg-blue-700"
            stories={politicaStories}
          />
          
          <SidebarSection 
            title="Sociedad" 
            color="bg-orange-700"
            stories={sociedadStories}
          />
        </aside>
      </main>

      <footer className="py-12 text-center text-xs text-gray-400 uppercase tracking-widest font-sans mt-16">
        Einsoft Intelligence Unit • 2026
      </footer>
    </div>
  );
}