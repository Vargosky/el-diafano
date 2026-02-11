import { createClient } from '@supabase/supabase-js';
import StoryCard from '@/components/StoryCard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fetchStories() {
  try {
    const { data, error } = await supabase
      .from('historias')
      .select(`
        id,
        titulo_generado,
        fecha_primer_reporte,
        tags,
        resumen_ia,
        noticias(id)
      `)
      .order('fecha_primer_reporte', { ascending: false })
      .limit(100); // Traemos más para ordenar localmente

    if (error) throw error;

    // Transformar y ordenar por número de medios
    const stories = data?.map(story => ({
      ...story,
      fecha: story.fecha_primer_reporte,
      total_noticias: story.noticias?.length || 0,
    })) || [];

    // Ordenar: primero por cantidad de medios (DESC), luego por fecha (DESC)
    stories.sort((a, b) => {
      if (b.total_noticias !== a.total_noticias) {
        return b.total_noticias - a.total_noticias;
      }
      return new Date(b.fecha) - new Date(a.fecha);
    });

    return stories.slice(0, 20); // Top 20
  } catch (e) {
    console.error('Error fetching stories:', e);
    return [];
  }
}

export default async function Page() {
  const stories = await fetchStories();

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b]">
      <nav className="sticky top-0 z-50 border-b border-[#e6e2d9] bg-[#f7f4ed]/95 backdrop-blur-md p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-[#2563eb] tracking-tighter italic">
            EINSOFT <span className="text-[#1a1a1b] not-italic">NEWS</span>
          </h1>
          <div className="text-[10px] font-bold text-[#65615a] bg-[#e6e2d9] px-2 py-1 rounded-sm uppercase tracking-tighter">
            LIVE FEED
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 bg-[#f7f4ed]">
        <div className="px-6 py-4 border-b border-[#e6e2d9] mb-4">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Portada Chilena</h2>
          <p className="text-[#65615a] text-sm italic">Motor de agrupamiento por consenso v1.0</p>
        </div>

        <div className="flex flex-col">
          {stories.map((story) => (
            <div key={story.id} className="border-b border-[#e6e2d9]">
               <StoryCard story={story} />
            </div>
          ))}
        </div>
      </main>

      <footer className="py-20 text-center text-[10px] text-[#a39e93] uppercase tracking-[0.2em]">
        Einsoft Intelligence Unit • 2026
      </footer>
    </div>
  );
}