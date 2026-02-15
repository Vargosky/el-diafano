import Link from 'next/link';

export default function TopPersonajes({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  const getSentimientoColor = (positivo, negativo, neutro) => {
    const total = positivo + negativo + neutro;
    const pctPositivo = (positivo / total) * 100;
    const pctNegativo = (negativo / total) * 100;

    if (pctPositivo > 60) return 'text-green-600';
    if (pctNegativo > 60) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSentimientoIcon = (positivo, negativo, neutro) => {
    const total = positivo + negativo + neutro;
    const pctPositivo = (positivo / total) * 100;
    const pctNegativo = (negativo / total) * 100;

    if (pctPositivo > 60) return '↗';
    if (pctNegativo > 60) return '↘';
    return '→';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase">
        Personajes Más Mencionados (7 días)
      </h3>

      <div className="space-y-3">
        {data.map((item, i) => {
          const sentimientoColor = getSentimientoColor(
            item.sentimiento_positivo,
            item.sentimiento_negativo,
            item.sentimiento_neutro
          );
          const sentimientoIcon = getSentimientoIcon(
            item.sentimiento_positivo,
            item.sentimiento_negativo,
            item.sentimiento_neutro
          );

          return (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400 w-6">
                    {i + 1}.
                  </span>


                  <Link
                    href={`/personaje/${item.personaje
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/ /g, '-')
                      }`}
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors"
                  >
                    {item.personaje}
                  </Link>

                  <span className={`text-lg ${sentimientoColor}`}>
                    {sentimientoIcon}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">
                  {item.menciones}
                </div>
                <div className="text-xs text-gray-500">
                  menciones
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500 flex gap-3">
        <span className="text-green-600">↗ Positivo</span>
        <span className="text-gray-600">→ Neutro</span>
        <span className="text-red-600">↘ Negativo</span>
      </div>
    </div>
  );
}