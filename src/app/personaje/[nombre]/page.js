import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import SentimentPieChart from '@/components/SentimentPieChart';
import NoticiasPersonaje from '@/components/NoticiasPersonaje';
import PersonajeCobertura from '@/components/PersonajeCobertura';
import HistoriaMes from '@/components/HistoriaMes';
import CoberturaMedios from '@/components/CoberturaMedios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PersonajePage({ params }) {
  const supabase = createClient();
  const { nombre: slug } = await params;

  const { data: noticias, error } = await supabase.rpc('get_personaje_details', {
    p_slug: slug,
  });

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error en SQL</h1>
        <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
        <Link href="/" className="text-blue-600 mt-4 block">← Volver</Link>
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Personaje no encontrado</h1>
        <p className="text-sm">Slug buscado: <strong>{slug}</strong></p>
        <Link href="/" className="text-blue-600 mt-4 block">← Volver</Link>
      </div>
    );
  }

  const personaje     = noticias[0];
  const noticiasReales = noticias.filter(n => n.noticia_id !== null);

  // Agrupar por medio — normalización en el componente
  const porMedio = noticiasReales.reduce((acc, n) => {
    const key = n.medio_nombre || 'Sin medio'
    if (!acc[key]) acc[key] = { total: 0, positivo: 0, negativo: 0, neutro: 0 }
    acc[key].total++
    if (n.sentimiento) acc[key][n.sentimiento] = (acc[key][n.sentimiento] || 0) + 1
    return acc
  }, {});

  return (
    <main className="min-h-screen bg-neutral-50">

      {/* Header */}
      <header className="bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
            ← Volver a El Diáfano
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ── PERFIL ─────────────────────────────────────────── */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {personaje.personaje_foto ? (
              <img
                src={personaje.personaje_foto}
                alt={personaje.personaje_nombre}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-gray-500">
                  {personaje.personaje_nombre?.split(' ').map(n => n[0]).join('') || '?'}
                </span>
              </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 mb-1">
                {personaje.personaje_nombre}
              </h1>
              {personaje.personaje_cargo && (
                <p className="text-lg text-gray-700 mb-1">{personaje.personaje_cargo}</p>
              )}
              {personaje.personaje_partido && (
                <p className="text-sm text-gray-500 mb-3">{personaje.personaje_partido}</p>
              )}
              {personaje.personaje_bio && (
                <p className="text-sm text-gray-700 text-justify leading-relaxed">
                  {personaje.personaje_bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── FILA 1: Sentimiento + Gráfico temporal ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Sentimiento dona */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 uppercase tracking-wide text-xs text-gray-500">
              Sentimiento en Cobertura · 7 días
            </h2>
            <SentimentPieChart
              positivo={personaje.menciones_positivas || 0}
              negativo={personaje.menciones_negativas || 0}
              neutro={personaje.menciones_neutras    || 0}
            />
            <div className="mt-4 space-y-2">
              {[
                { label: '▲ Positivo', val: personaje.menciones_positivas, color: 'text-green-600' },
                { label: '● Neutro',   val: personaje.menciones_neutras,   color: 'text-gray-500'  },
                { label: '▼ Negativo', val: personaje.menciones_negativas, color: 'text-red-600'   },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className={color}>{label}</span>
                  <span className="font-bold">{val || 0} menciones</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico temporal */}
          <PersonajeCobertura noticias={noticiasReales} />
        </div>

        {/* ── FILA 2: Historia del Mes — ancho completo ──────── */}
        <HistoriaMes slug={slug} />

        {/* ── FILA 3: Cobertura por Medio — ancho completo ───── */}
        <CoberturaMedios porMedio={porMedio} />

        {/* ── FILA 4: Noticias Recientes ──────────────────────── */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Noticias Recientes ({personaje.total_menciones || 0})
          </h2>
          <NoticiasPersonaje noticias={noticias} />
        </div>

      </div>
    </main>
  );
}