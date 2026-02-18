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

// ─── Helper: rango de un día completo en UTC ──────────────────────────────────
function diaRango(fechaStr) {
  // fechaStr: 'YYYY-MM-DD'
  return {
    desde: `${fechaStr}T00:00:00+00:00`,
    hasta: `${fechaStr}T23:59:59+00:00`,
  };
}

function esHoy(fechaStr) {
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  return fechaStr === hoyStr;
}

export default async function Home({ searchParams }) {
  const supabase = createClient();

  const params = await searchParams;
  const tab = params?.tab || 'todas';

  // ── Fecha seleccionada ────────────────────────────────────────────────────
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const fechaStr = (params?.fecha && /^\d{4}-\d{2}-\d{2}$/.test(params.fecha))
    ? params.fecha
    : hoyStr;
  const modoArchivo = !esHoy(fechaStr);

  // ── Fetch de historias ─────────────────────────────────────────────────────
  let historias = [];

  if (modoArchivo) {
    // MODO ARCHIVO: traer historias del día exacto desde la tabla
    const { desde, hasta } = diaRango(fechaStr);
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
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('peso_relevancia', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching historias de archivo:', error);
    } else {
      // Normalizar al mismo shape que get_stories_with_bias
      historias = (data || []).map(h => ({
        ...h,
        total_noticias: h.noticias_procesadas_count || h.conteo || 0,
        total_medios: 0, // no disponible sin RPC, se puede agregar después
        sesgo_izquierda: 0,
        sesgo_centro_izq: 0,
        sesgo_centro: 0,
        sesgo_centro_der: 0,
        sesgo_derecha: 0,
      }));
    }
  } else {
    // MODO HOY: usar la RPC existente (últimos 7 días, con bias calculado)
    const { data, error } = await supabase.rpc('get_stories_with_bias', {
      dias_atras: 7,
      limite: 100,
    });

    if (error) {
      console.error('Error fetching stories:', error);
      return <div>Error cargando historias</div>;
    }
    historias = data || [];
  }

  // ── Filtrar y ordenar según tab ───────────────────────────────────────────
  let todasHistorias = [...historias];

  if (tab === 'todas') {
    if (!modoArchivo) {
      // Solo en modo hoy filtramos por 48h
      const tiempoActual = new Date().getTime();
      todasHistorias = historias.filter(h => {
        const edad = (tiempoActual - new Date(h.fecha).getTime()) / (1000 * 60 * 60);
        return edad <= 48;
      });
    }
    todasHistorias = todasHistorias.sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      if (b.total_noticias !== a.total_noticias) return b.total_noticias - a.total_noticias;
      return (b.peso_relevancia || 0) - (a.peso_relevancia || 0);
    }).slice(0, 5);

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

  // ── Columnas laterales ─────────────────────────────────────────────────────
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
  // En modo archivo, los stats de personajes y categorías se filtran por fecha
  const [{ data: categoryStats }, { data: topPersonajes }] = await Promise.all([
    supabase.rpc('get_category_stats'),
    supabase.rpc('get_top_personajes'),
  ]);

  // ── Fechas activas para el calendario ─────────────────────────────────────
  // Trae las fechas distintas que tienen historias (para los puntitos)
  const { data: fechasData } = await supabase
    .from('historias')
    .select('fecha')
    .gte('fecha', '2024-01-01T00:00:00+00:00');

  const activeDates = fechasData
    ? [...new Set(fechasData.map(h => h.fecha?.slice(0, 10)).filter(Boolean))]
    : [];

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {/* Banner de modo archivo */}
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

        {/* MOBILE LAYOUT */}
        <div className="lg:hidden space-y-6">

          <TabSelector />

          <FeedController stories={feed} key={tab + fechaStr} />

          {categoryStats && categoryStats.length > 0 && (
            <CategoryPieChart data={categoryStats} />
          )}

          {topPersonajes && topPersonajes.length > 0 && (
            <TopPersonajes data={topPersonajes} />
          )}
          {/* DateNavigator mobile: encima del feed */}
          <DateNavigator activeDates={activeDates} />

          <CategoryColumn title="POLÍTICA" stories={politica} color="blue" />
          <CategoryColumn title="ECONOMÍA" stories={economia} color="green" />
        </div>

        {/* DESKTOP LAYOUT */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">

          {/* Sidebar izquierdo */}
          <aside className="lg:col-span-3 space-y-6">
            {categoryStats && categoryStats.length > 0 && (
              <CategoryPieChart data={categoryStats} />
            )}

            {topPersonajes && topPersonajes.length > 0 && (
              <TopPersonajes data={topPersonajes} />
            )}

            {/* ── DateNavigator: después de TopPersonajes ── */}
            <DateNavigator activeDates={activeDates} />

            <CategoryColumn title="ECONOMÍA" stories={economia} color="green" />
          </aside>

          {/* Feed central */}
          <section className="lg:col-span-6">
            <TabSelector />
            <FeedController stories={feed} key={tab + fechaStr} />
          </section>

          {/* Sidebar derecho */}
          <aside className="lg:col-span-3">
            <CategoryColumn title="POLÍTICA" stories={politica} color="blue" />
          </aside>

        </div>
      </div>
    </main>
  );
}