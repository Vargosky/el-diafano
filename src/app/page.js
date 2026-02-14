import Header from '@/components/Header';
import FeedController from '@/components/FeedController';
import CategoryColumn from '@/components/CategoryColumn';
import CategoryPieChart from '@/components/CategoryPieChart';
import TabSelector from '@/components/TabSelector';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }) {
  const supabase = createClient();
  
  // ✅ AWAIT searchParams primero
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
  
  if (tab === 'top') {
    todasHistorias.sort((a, b) => (b.peso_relevancia || 0) - (a.peso_relevancia || 0));
  } else if (tab === 'recientes') {
    todasHistorias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  const economia = todasHistorias
    .filter(h => h.categoria_ia === 'Economía')
    .slice(0, 6);

  const politica = todasHistorias
    .filter(h => h.categoria_ia === 'Política')
    .slice(0, 6);

  const feedCompleto = todasHistorias
    .filter(h => !['Economía', 'Política'].includes(h.categoria_ia));

  const feed = feedCompleto.slice(0, 5);

  const { data: categoryStats } = await supabase.rpc('get_category_stats');

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">
        
        {/* MOBILE LAYOUT */}
        <div className="lg:hidden space-y-6">
          <TabSelector />
          
          {/* DEBUG */}
          {/* <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded px-3 py-2">
            📊 Filtro: <strong>{tab}</strong> | 
            Mostrando: <strong>{feed.length}</strong> historias |
            IDs: {feed.map(h => h.id).join(', ')}
          </div> */}
          
          <FeedController stories={feed} key={tab} />
          
          {categoryStats && categoryStats.length > 0 && (
            <CategoryPieChart data={categoryStats} />
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
            
            <CategoryColumn 
              title="ECONOMÍA" 
              stories={economia} 
              color="green"
            />
          </aside>

          <section className="lg:col-span-6">
            <TabSelector />
            
            {/* DEBUG */}
            {/* <div className="text-xs text-gray-600 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 mb-4">
              📊 Filtro: <strong>{tab}</strong> | 
              Mostrando: <strong>{feed.length}</strong> historias
            </div> */}
            
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