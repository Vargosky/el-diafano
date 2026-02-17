'use client';

export default function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Colores por categoría
  const colors = {
    'Política': '#1565C0',
    'Economía': '#2E7D32',
    'Sociedad': '#D32F2F',
    'Deportes': '#F57C00',
    'Mundo': '#7B1FA2',
    'Cultura': '#C2185B',
    'Tecnología': '#0288D1',
    'Seguridad': '#5D4037',
    'Salud': '#00897B'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-bold text-sm text-gray-900 mb-4 uppercase">
        Temas Principales (7 días)
      </h3>
      
      {/* Lista con barras */}
      <div className="space-y-3">
        {data.slice(0, 6).map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold text-gray-700">
                {item.categoria}
              </span>
              <span className="text-xs font-bold text-gray-900">
                {item.porcentaje}%
              </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all"
                style={{ 
                  width: `${item.porcentaje}%`,
                  backgroundColor: colors[item.categoria] || '#616161'
                }}
              />
            </div>

            <div className="text-xs text-gray-500 mt-1">
              {item.total_noticias} historias
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}