'use client';

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) return null;

  const colors = {
    'Política':   '#1565C0',
    'Economía':   '#2E7D32',
    'Sociedad':   '#D32F2F',
    'Deportes':   '#F57C00',
    'Mundo':      '#7B1FA2',
    'Cultura':    '#C2185B',
    'Tecnología': '#0288D1',
    'Seguridad':  '#5D4037',
    'Salud':      '#00897B',
    'General':    '#616161',
  };

  const totalGlobal = data.reduce((sum, item) => sum + Number(item.total), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase">
        Temas Principales (7 días)
      </h3>

      <div className="space-y-3">
        {data.slice(0, 6).map((item, i) => {
          const porcentaje = totalGlobal > 0
            ? Math.round((Number(item.total) / totalGlobal) * 100)
            : 0;

          return (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700">
                  {item.categoria}
                </span>
                <span className="text-xs font-bold text-gray-900">
                  {porcentaje}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${porcentaje}%`,
                    backgroundColor: colors[item.categoria] || '#616161',
                  }}
                />
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {item.total} historias
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}