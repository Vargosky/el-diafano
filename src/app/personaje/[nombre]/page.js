import { createClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SentimentPieChart from '@/components/SentimentPieChart';
import NoticiasPersonaje from '@/components/NoticiasPersonaje';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PersonajePage({ params }) {
  const supabase = createClient();
  
  const resolvedParams = await params;
  const slug = resolvedParams.nombre;
  
  const { data: noticias, error } = await supabase.rpc('get_personaje_details', {
    p_slug: slug
  });

  // DEBUG
  console.log('🔍 Slug buscado:', slug);
  console.log('🔍 Error:', error);
  console.log('🔍 Noticias:', noticias);
  console.log('🔍 Cantidad:', noticias?.length);

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Error en SQL</h1>
        <pre className="bg-red-100 p-4 rounded overflow-auto text-xs sm:text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
        <p className="mt-4 text-sm">Slug buscado: {slug}</p>
        <Link href="/" className="text-blue-600 mt-4 block">← Volver</Link>
      </div>
    );
  }

  if (!noticias || noticias.length === 0) {
    return (
      <div className="p-4 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Personaje no encontrado</h1>
        <p className="text-sm sm:text-base">
          No se encontró el personaje con slug: <strong>{slug}</strong>
        </p>
        <p className="mt-4 text-sm">Verifica que:</p>
        <ul className="list-disc ml-6 text-sm">
          <li>El personaje existe en la tabla `personajes`</li>
          <li>El slug es correcto (sin espacios, en minúsculas)</li>
          <li>Hay datos en entidades_temp</li>
        </ul>
        <Link href="/" className="text-blue-600 mt-4 block">← Volver</Link>
      </div>
    );
  }

  // Datos del personaje (están en todas las filas)
  const personaje = noticias[0];
  
  // Filtrar noticias (puede haber filas sin noticia_id si no hay menciones)
  const noticiasReales = noticias.filter(n => n.noticia_id !== null);
  
  // Agrupar por medio
  const porMedio = noticiasReales.reduce((acc, n) => {
    if (!acc[n.medio_nombre]) {
      acc[n.medio_nombre] = { total: 0, positivo: 0, negativo: 0, neutro: 0 };
    }
    acc[n.medio_nombre].total++;
    if (n.sentimiento) {
      acc[n.medio_nombre][n.sentimiento]++;
    }
    return acc;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Perfil del personaje */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Foto */}
            {personaje.personaje_foto ? (
              <img 
                src={personaje.personaje_foto} 
                alt={personaje.personaje_nombre}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 flex-shrink-0">
                <span className="text-3xl sm:text-4xl font-bold">
                  {personaje.personaje_nombre.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-gray-900 mb-2">
                {personaje.personaje_nombre}
              </h1>
              
              {personaje.personaje_cargo && (
                <p className="text-base sm:text-lg text-gray-700 mb-1">
                  {personaje.personaje_cargo}
                </p>
              )}
              
              {personaje.personaje_partido && (
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                  {personaje.personaje_partido}
                </p>
              )}
              
              {personaje.personaje_bio && (
                <p className="text-sm text-gray-700 text-justify">
                  {personaje.personaje_bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Sentimiento general */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Sentimiento en Cobertura (7 días)
            </h2>
            
            <SentimentPieChart 
              positivo={personaje.menciones_positivas || 0}
              negativo={personaje.menciones_negativas || 0}
              neutro={personaje.menciones_neutras || 0}
            />

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✓ Positivo</span>
                <span className="font-bold">{personaje.menciones_positivas || 0} menciones</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">→ Neutro</span>
                <span className="font-bold">{personaje.menciones_neutras || 0} menciones</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">✗ Negativo</span>
                <span className="font-bold">{personaje.menciones_negativas || 0} menciones</span>
              </div>
            </div>
          </div>

          {/* Por medio */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
              Cobertura por Medio
            </h2>
            
            {Object.keys(porMedio).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(porMedio)
                  .sort((a, b) => b[1].total - a[1].total)
                  .map(([medio, stats]) => {
                    const pctNeg = (stats.negativo / stats.total) * 100;
                    const pctPos = (stats.positivo / stats.total) * 100;
                    const pctNeu = (stats.neutro / stats.total) * 100;
                    
                    return (
                      <div key={medio} className="border-b border-gray-200 pb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sm truncate mr-2">{medio}</span>
                          <span className="text-xs text-gray-600 whitespace-nowrap">
                            {stats.total} menciones
                          </span>
                        </div>
                        <div className="flex gap-1 h-2">
                          {pctPos > 0 && (
                            <div 
                              className="bg-green-500 rounded"
                              style={{ width: `${pctPos}%` }}
                              title={`${stats.positivo} positivo`}
                            />
                          )}
                          {pctNeu > 0 && (
                            <div 
                              className="bg-gray-400 rounded"
                              style={{ width: `${pctNeu}%` }}
                              title={`${stats.neutro} neutro`}
                            />
                          )}
                          {pctNeg > 0 && (
                            <div 
                              className="bg-red-500 rounded"
                              style={{ width: `${pctNeg}%` }}
                              title={`${stats.negativo} negativo`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Sin menciones en medios</p>
            )}
          </div>
        </div>

        {/* Lista de noticias */}
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