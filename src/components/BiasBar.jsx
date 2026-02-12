// src/components/BiasBar.jsx

export default function BiasBar({ 
  izquierda = 0, 
  centro_izq = 0, 
  centro = 0, 
  centro_der = 0, 
  derecha = 0,
  className = ""
}) {
  const total = izquierda + centro_izq + centro + centro_der + derecha;
  
  if (total === 0) {
    return (
      <div className={`text-xs text-gray-400 italic ${className}`}>
        Sin cobertura mediática
      </div>
    );
  }
  
  // Calcular porcentajes
  const pct = {
    izq: (izquierda / total * 100).toFixed(0),
    cizq: (centro_izq / total * 100).toFixed(0),
    cen: (centro / total * 100).toFixed(0),
    cder: (centro_der / total * 100).toFixed(0),
    der: (derecha / total * 100).toFixed(0),
  };
  
  // Colores Ground News style
  const colores = {
    izq: '#D32F2F',      // Rojo intenso
    cizq: '#FFCDD2',     // Rojo muy claro
    cen: '#F5F5F5',      // Casi blanco
    cder: '#BBDEFB',     // Azul muy claro
    der: '#1565C0'       // Azul intenso
  };
  
  return (
    <div className={`w-full ${className}`}>
      {/* Barra de colores */}
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden flex">
        {/* Segmento Izquierda */}
        {izquierda > 0 && (
          <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ 
              width: `${pct.izq}%`,
              backgroundColor: colores.izq,
            }}
          >
            {pct.izq > 8 && `I: ${pct.izq}%`}
          </div>
        )}
        
        {/* Segmento Centro-Izquierda */}
        {centro_izq > 0 && (
          <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-gray-700 transition-all"
            style={{ 
              width: `${pct.cizq}%`,
              backgroundColor: colores.cizq 
            }}
          >
            {pct.cizq > 8 && `CI: ${pct.cizq}%`}
          </div>
        )}
        
        {/* Segmento Centro */}
        {centro > 0 && (
          <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-gray-900 transition-all"
            style={{ 
              width: `${pct.cen}%`,
              backgroundColor: colores.cen 
            }}
          >
            {pct.cen > 8 && `C: ${pct.cen}%`}
          </div>
        )}
        
        {/* Segmento Centro-Derecha */}
        {centro_der > 0 && (
          <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-gray-700 transition-all"
            style={{ 
              width: `${pct.cder}%`,
              backgroundColor: colores.cder 
            }}
          >
            {pct.cder > 8 && `CD: ${pct.cder}%`}
          </div>
        )}
        
        {/* Segmento Derecha */}
        {derecha > 0 && (
          <div 
            className="h-full flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ 
              width: `${pct.der}%`,
              backgroundColor: colores.der 
            }}
          >
            {pct.der > 8 && `D: ${pct.der}%`}
          </div>
        )}
      </div>
      
      {/* Total de medios */}
      <div className="text-right text-[10px] text-gray-500 mt-1 font-sans">
        {total} {total === 1 ? 'medio' : 'medios'}
      </div>
    </div>
  );
}
