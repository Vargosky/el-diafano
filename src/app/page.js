import Header from '@/components/Header';
import FeedController from '@/components/FeedController';
import CategoryColumn from '@/components/CategoryColumn';
import CategoryPieChart from '@/components/CategoryPieChart';
import TopPersonajes from '@/components/TopPersonajes';
import TabSelector from '@/components/TabSelector';
import DateNavigator from '@/components/DateNavigator';
import MediosChart from '@/components/MediosChart';
import { createClient } from '@/lib/supabase';
import { getHistoriasHoy, getHistoriasArchivo, getActiveDates, prepararFeed } from '@/lib/queries/historias';
import { getCategoryStats, getNoticiasPorMedio } from '@/lib/queries/stats';
import { getTopPersonajes } from '@/lib/queries/personajes';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getHoyStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function Home({ searchParams }) {
  const supabase = createClient();
  const params   = await searchParams;

  const tab      = params?.tab || 'todas';
  const hoyStr   = getHoyStr();
  const fechaStr = (params?.fecha && /^\d{4}-\d{2}-\d{2}$/.test(params.fecha))
    ? params.fecha
    : hoyStr;
  const modoArchivo = fechaStr !== hoyStr;

  const [historias, categoryStats, topPersonajes, activeDates, noticiasPorMedio] = await Promise.all([
    modoArchivo ? getHistoriasArchivo(supabase, fechaStr) : getHistoriasHoy(supabase),
    getCategoryStats(supabase),
    getTopPersonajes(supabase),
    getActiveDates(supabase),
    getNoticiasPorMedio(supabase, 7),
  ]);

  const { feed, politica, economia } = prepararFeed(historias, tab);

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />

      {modoArchivo && (
        <div className="bg-amber-50 border-b border-amber-200 text-center py-2 px-4 text-sm text-amber-800 font-medium">
          Estas viendo la edicion del{' '}
          <strong>
            {new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-CL', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </strong>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-8">

        {/* MOBILE */}
        <div className="lg:hidden space-y-6 pb-24">
          <TabSelector />
          <FeedController stories={feed} key={tab + fechaStr} />
          {categoryStats?.length > 0    && <CategoryPieChart data={categoryStats} />}
          {topPersonajes?.length  > 0   && <TopPersonajes    data={topPersonajes} />}
          {noticiasPorMedio?.length > 0  && <MediosChart      data={noticiasPorMedio} />}
          <CategoryColumn title="POLITICA" stories={politica} color="blue"  />
          <CategoryColumn title="ECONOMIA" stories={economia} color="green" />
        </div>

        {/* BARRA INFERIOR MOBILE */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg px-4 py-2">
          <DateNavigator activeDates={activeDates} />
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6">

          <aside className="lg:col-span-3 space-y-6">
            {categoryStats?.length > 0   && <CategoryPieChart data={categoryStats} />}
            {topPersonajes?.length  > 0  && <TopPersonajes    data={topPersonajes} />}
            <DateNavigator activeDates={activeDates} />
            {noticiasPorMedio?.length > 0 && <MediosChart     data={noticiasPorMedio} />}
            <CategoryColumn title="ECONOMIA" stories={economia} color="green" />
          </aside>

          <section className="lg:col-span-6">
            <TabSelector />
            <FeedController stories={feed} key={tab + fechaStr} />
          </section>

          <aside className="lg:col-span-3">
            <CategoryColumn title="POLITICA" stories={politica} color="blue" />
          </aside>

        </div>
      </div>
    </main>
  );
}