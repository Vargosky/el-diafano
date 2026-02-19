import Header from '@/components/Header';
import FeedController from '@/components/FeedController';
import CategoryColumn from '@/components/CategoryColumn';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopPersonajes from '@/components/TopPersonajes';
import TabSelector from '@/components/TabSelector';
import DateNavigator from '@/components/DateNavigator';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getHoyStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function esHoy(fechaStr) {
  return fechaStr === getHoyStr();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home({ searchParams }) {
  const supabase = createClient();

  const params  = await searchParams;
  const tab     = params?.tab || 'todas';

  // Fecha seleccionada — desde URL o hoy
  const hoyStr   = getHoyStr();
  const fechaStr = (params?.fecha && /^\d{4}-\d{2}-\d{2}$/.test(params.fecha))
    ? params.fecha
    : hoyStr;
  const modoArchivo = !esHoy(fechaStr);

  // ── Fetch historias ────────────────────────────────────────────────────────

  let historias = [];

  if (modoArchivo) {
    // Modo archivo: query directo filtrando por día exacto
    const { data, error } = await supabase
      .from('historias')
      .select(`
        id,
        titulo_generado,
        resumen_ia,
        categoria,
        categoria_ia,
        peso_relevancia,
        peso_calculado,
        conteo,
        tags,
        fecha,
        noticias_procesadas_count
      `)
      .gte('fecha', `${fechaStr}T00:00:00+00:00`)
      .lte('fecha', `${fechaStr}T23:59:59+00:00`)
      .order('peso_relevancia', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching historias archivo:', error);
    } else {
      // Normalizar al mismo shape que get_stories_with_bias
      historias = (data || []).map(h => ({
        ...h,
        total_noticias:    h.noticias_procesadas_count || h.conteo || 0,
        total_medios:      0,
        sesgo_izquierda:   0,
        sesgo_centro_izq:  0,
        sesgo_centro:      0,
        sesgo_centro_der:  0,
        sesgo_derecha:     0,
      }));
    }
  } else {
    // Modo hoy: RPC con bias calculado — 2 días = 48h
    const { data, error } = await supabase.rpc('get_stories_with_bias', {
      dias_atras: 2,
      limite:     100,
    });

    if (error) {
      console.error('Error fetching stories:', error);
      return <div>Error cargando historias</div>;
    }
    historias = data || [];
  }

  // ── Filtro de seguridad: no mostrar noticias del futuro ────────────────────
  const ahora = new Date().getTime();
  historias = historias.filter(h => {
    if (!h.fecha) return false;
    return new Date(h.fecha).getTime() <= ahora;
  });

  // ── Ordenar según tab ──────────────────────────────────────────────────────

  let todasHistorias = [...historias];

  if (tab === 'todas') {
    todasHistorias = todasHistorias
      .sort((a, b) => {
        if (b.total_medios !== a.total_medios)     return b.total_medios - a.total_medios;
        if (b.total_noticias !== a.total_noticias) return b.total_noticias - a.total_noticias;
        return (b.peso_relevancia || 0) - (a.peso_relevancia || 0);
      })
      .slice(0, 5);

  } else if (tab === 'top') {
    todasHistorias.sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    });

  } else if (tab === 'cobertura') {
    todasHistorias.sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return new Date(b.fecha) - new Date(a.fecha);
    });

  } else if (tab === 'recientes') {
    todasHistorias.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  // ── Columnas laterales (del pool completo del día) ─────────────────────────

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

  // Feed central: excluye Economía y Política
  const feed = todasHistorias
    .filter(h => !['Economía', 'Política'].includes(h.categoria_ia))
    .slice(0, 5);

  // ── Stats sidebar ──────────────────────────────────────────────────────────

  const [{ data: categoryStats }, { data: topPersonajes }] = await Promise.all([
    supabase.rpc('get_category_stats'),
    supabase.rpc('get_top_personajes'),
  ]);

  // ── Fechas activas para puntitos del calendario ────────────────────────────

  const { data: fechasData } = await supabase
    .from('historias')
    .select('fecha')
    .gte('fecha', '2024-01-01T00:00:00+00:00');

  const activeDates = fechasData
    ? [...new Set(fechasData.map(h => h.fecha?.slice(0, 10)).filter(Boolean))]
    : [];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Banner modo archivo */}
      {modoArchivo && (
        <div className="bg-amber-50 border-b border-amber-200 text-center py-2 px-4 text-sm text-amber-800 font-medium">
          Estás viendo la edición del{' '}
          <strong>
            {new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-CL', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </strong>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">

        {/* ── MOBILE LAYOUT ── */}
        <div className="lg:hidden space-y-6 pb-24">
          <TabSelector />
          <FeedController stories={feed} key={tab + fechaStr} />

          {categoryStats && categoryStats.length > 0 && (
            <CategoryPieChart data={categoryStats} />
          )}
          {topPersonajes && topPersonajes.length > 0 && (
            <TopPersonajes data={topPersonajes} />
          )}

          <CategoryColumn title="POLÍTICA" stories={politica} color="blue"  />
          <CategoryColumn title="ECONOMÍA" stories={economia} color="green" />
        </div>

        {/* ── BARRA INFERIOR MOBILE ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-2">
          <DateNavigator activeDates={activeDates} />
        </div>

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">

          <aside className="lg:col-span-3 space-y-6">
            {categoryStats && categoryStats.length > 0 && (
              <CategoryPieChart data={categoryStats} />
            )}
            {topPersonajes && topPersonajes.length > 0 && (
              <TopPersonajes data={topPersonajes} />
            )}

            {/* DateNavigator: después de TopPersonajes */}
            <DateNavigator activeDates={activeDates} />

            <CategoryColumn title="ECONOMÍA" stories={economia} color="green" />
          </aside>

          <section className="lg:col-span-6">
            <TabSelector />
            <FeedController stories={feed} key={tab + fechaStr} />
          </section>

          <aside className="lg:col-span-3">
            <CategoryColumn title="POLÍTICA" stories={politica} color="blue" />
          </aside>

        </div>
      </div>
    </main>
  );
}