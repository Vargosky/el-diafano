import Header from '@/components/Header';
import FeedController from '@/components/FeedController';
import CategoryColumn from '@/components/CategoryColumn';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopPersonajes from '@/components/TopPersonajes';
import TabSelector from '@/components/TabSelector';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }) {
  const supabase = createClient();
  
  const params = await searchParams;
  const tab = params?.tab || 'todas';

  const { data: historias, error } = await supabase.rpc('get_stories_with_bias', {
    dias_atras: 7,
    limite: 100
  });

  if (error) {
    console.error('Error fetching stories:', error);
    return <div>Error cargando historias</div>;
  }

  // FILTRAR Y ORDENAR
  let todasHistorias = [...historias];
  
  if (tab === 'todas') {
    const tiempoActual = new Date().getTime();
    
    // Filtrar historias de las últimas 48 horas
    const historiasRecientes = historias.filter(historia => {
      const fechaNoticia = new Date(historia.fecha);
      const edadNoticia = (tiempoActual - fechaNoticia.getTime()) / (1000 * 60 * 60);
      return edadNoticia <= 48; // 48 horas
    });

    // console.log('Historias recientes (48h):', historiasRecientes.length);
  
    // Ordenar por número de medios, luego por número de noticias, luego por peso de relevancia
    const historiasOrdenadas = historiasRecientes.sort((a, b) => {
      // Primero por total_medios
      if (b.total_medios !== a.total_medios) {
        return b.total_medios - a.total_medios;
      }
      
      // Si empatan en medios, por total_noticias
      if (b.total_noticias !== a.total_noticias) {
        return b.total_noticias - a.total_noticias;
      }
      
      // Si empatan, por peso de relevancia
      return (b.peso_relevancia || 0) - (a.peso_relevancia || 0);
    });
  
    // Tomar las 5 primeras historias
    todasHistorias = historiasOrdenadas.slice(0, 5);
  }
  
  else if (tab === 'top') {
    // Primero ordenar por total_medios, luego por total_noticias
    todasHistorias.sort((a, b) => {
      if (b.total_medios !== a.total_medios) {
        return b.total_medios - a.total_medios;
      }
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    });
    
  } else if (tab === 'cobertura') {
    // Cobertura - Estilo Google News
    // Primero por total_medios, luego por fecha
    todasHistorias.sort((a, b) => {
      if (b.total_medios !== a.total_medios) {
        return b.total_medios - a.total_medios;
      }
      return new Date(b.fecha) - new Date(a.fecha);
    });
    
  } else if (tab === 'recientes') {
    // Recientes: Solo por fecha
    todasHistorias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  // Las columnas laterales siempre usan el array completo (independiente del tab)
  // para garantizar que siempre tengan contenido
  const economia = historias
    .filter(h => h.categoria_ia === 'Economía')
    .sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    })
    .slice(0, 6);

  const politica = historias
    .filter(h => h.categoria_ia === 'Política')
    .sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    })
    .slice(0, 6);

  // El feed central excluye Economía y Política de todasHistorias (ya filtrado/ordenado por tab)
  const feedCompleto = todasHistorias
    .filter(h => !['Economía', 'Política'].includes(h.categoria_ia));

  const feed = feedCompleto.slice(0, 5);

  const { data: categoryStats } = await supabase.rpc('get_category_stats');
  const { data: topPersonajes } = await supabase.rpc('get_top_personajes');

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* MOBILE LAYOUT */}
        <div className="lg:hidden space-y-6">
          <TabSelector />
          
          <FeedController stories={feed} key={tab} />
          
          {categoryStats && categoryStats.length > 0 && (
            <CategoryPieChart data={categoryStats} />
          )}
          
          {topPersonajes && topPersonajes.length > 0 && (
            <TopPersonajes data={topPersonajes} />
          )}
          
          <CategoryColumn 
            title="POLÍTICA" 
            stories={politica} 
            color="blue"
          />
          
          <CategoryColumn 
            title="ECONOMÍA" 
            stories={economia} 
            color="green"
          />
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">
          
          <aside className="lg:col-span-3 space-y-6">
            {categoryStats && categoryStats.length > 0 && (
              <CategoryPieChart data={categoryStats} />
            )}
            
            {topPersonajes && topPersonajes.length > 0 && (
              <TopPersonajes data={topPersonajes} />
            )}
            
            <CategoryColumn 
              title="ECONOMÍA" 
              stories={economia} 
              color="green"
            />
          </aside>

          <section className="lg:col-span-6">
            <TabSelector />
            
            <FeedController stories={feed} key={tab} />
          </section>

          <aside className="lg:col-span-3">
            <CategoryColumn 
              title="POLÍTICA" 
              stories={politica} 
              color="blue"
            />
          </aside>
        </div>
      </div>
    </main>
  );
}