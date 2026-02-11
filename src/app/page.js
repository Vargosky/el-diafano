// src/app/page.js
import { createClient } from '@supabase/supabase-js';
import FeedController from '@/components/FeedController';
import SidebarSection from '@/components/SidebarSection';
import LiveFeedIndicator from '@/components/LiveFeedIndicator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getStories() {
  try {
    const { data, error } = await supabase
      .from('historias')
      .select(`
        id,
        titulo_generado,
        fecha,
        tags,
        resumen_ia,
        categoria_ia,
        peso_relevancia,
        noticias(id, medio_id)
      `)
      .eq('estado', 'activo')
      .gte('fecha', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    if (error) throw error;

    const stories = data?.map(story => ({
      ...story,
      peso: story.peso_relevancia || 0,
      total_noticias: story.noticias?.length || 0,
      total_medios: story.noticias ? new Set(story.noticias.map(n => n.medio_id)).size : 0,
    })) || [];

    return stories;
  } catch (error) {
    console.error('Error al obtener historias:', error);
    return [];
  }
}

// Nueva función para obtener la última actualización
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