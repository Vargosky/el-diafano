/**
 * Clasificación de medios chilenos por sesgo político y credibilidad
 * Basado en análisis de contenido y estudios de medios
 */

export const MEDIOS_CHILE = {
  // Izquierda
  'El Mostrador': { 
    sesgo: 'izquierda', 
    credibilidad: 'alta',
    color: '#3b82f6',
    descripcion: 'Medio digital independiente de centro-izquierda'
  },
  'El Desconcierto': { 
    sesgo: 'izquierda', 
    credibilidad: 'media',
    color: '#3b82f6',
    descripcion: 'Medio digital progresista'
  },
  'The Clinic': { 
    sesgo: 'izquierda', 
    credibilidad: 'media',
    color: '#3b82f6',
    descripcion: 'Revista satírica y de investigación'
  },
  'Radio y Diario Universidad de Chile': { 
    sesgo: 'izquierda', 
    credibilidad: 'alta',
    color: '#3b82f6',
    descripcion: 'Medio universitario público'
  },

  // Centro
  'CIPER': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Centro de Investigación Periodística'
  },
  'La Tercera': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Diario de centro con inclinación centro-derecha'
  },
  'T13': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Noticiario de Canal 13'
  },
  'CNN Chile': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Canal de noticias 24/7'
  },
  'BioBioChile': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Medio digital de Radio Bío-Bío'
  },
  'Meganoticias': { 
    sesgo: 'centro', 
    credibilidad: 'media',
    color: '#8b5cf6',
    descripcion: 'Noticiario de Mega'
  },
  'Chilevisión': { 
    sesgo: 'centro', 
    credibilidad: 'media',
    color: '#8b5cf6',
    descripcion: 'Canal de televisión abierta'
  },
  'ADN Radio': { 
    sesgo: 'centro', 
    credibilidad: 'alta',
    color: '#8b5cf6',
    descripcion: 'Radio de noticias'
  },

  // Derecha
  'El Mercurio': { 
    sesgo: 'derecha', 
    credibilidad: 'alta',
    color: '#ef4444',
    descripcion: 'Principal diario de centro-derecha'
  },
  'Las Últimas Noticias (LUN)': { 
    sesgo: 'derecha', 
    credibilidad: 'media',
    color: '#ef4444',
    descripcion: 'Diario popular de El Mercurio'
  },
  'Emol': { 
    sesgo: 'derecha', 
    credibilidad: 'alta',
    color: '#ef4444',
    descripcion: 'Portal digital de El Mercurio'
  },
  'La Segunda': { 
    sesgo: 'derecha', 
    credibilidad: 'alta',
    color: '#ef4444',
    descripcion: 'Diario vespertino de El Mercurio'
  },
  'El Líbero': { 
    sesgo: 'derecha', 
    credibilidad: 'media',
    color: '#ef4444',
    descripcion: 'Medio digital libertario'
  },
  'Pauta': { 
    sesgo: 'derecha', 
    credibilidad: 'alta',
    color: '#ef4444',
    descripcion: 'Revista de negocios y economía'
  },
};

/**
 * Obtiene información de un medio por su nombre
 */
export function getMedioInfo(nombreMedio) {
  // Búsqueda exacta
  if (MEDIOS_CHILE[nombreMedio]) {
    return MEDIOS_CHILE[nombreMedio];
  }

  // Búsqueda parcial (por si el nombre está incompleto)
  const medioEncontrado = Object.keys(MEDIOS_CHILE).find(medio => 
    nombreMedio.toLowerCase().includes(medio.toLowerCase()) ||
    medio.toLowerCase().includes(nombreMedio.toLowerCase())
  );

  if (medioEncontrado) {
    return MEDIOS_CHILE[medioEncontrado];
  }

  // Por defecto, si no se encuentra
  return { 
    sesgo: 'desconocido', 
    credibilidad: 'desconocida',
    color: '#64748b',
    descripcion: 'Clasificación pendiente'
  };
}

/**
 * Calcula la distribución de sesgo político de un conjunto de noticias
 */
export function calcularDistribucionSesgo(noticias) {
  if (!noticias || noticias.length === 0) {
    return { izquierda: 0, centro: 0, derecha: 0, desconocido: 0 };
  }

  const distribucion = {
    izquierda: 0,
    centro: 0,
    derecha: 0,
    desconocido: 0
  };

  noticias.forEach(noticia => {
    const medioInfo = getMedioInfo(noticia.medio_nombre || noticia.medio_nombre_backup || '');
    const sesgo = medioInfo.sesgo;
    
    if (distribucion.hasOwnProperty(sesgo)) {
      distribucion[sesgo]++;
    } else {
      distribucion.desconocido++;
    }
  });

  // Convertir a porcentajes
  const total = noticias.length;
  return {
    izquierda: Math.round((distribucion.izquierda / total) * 100),
    centro: Math.round((distribucion.centro / total) * 100),
    derecha: Math.round((distribucion.derecha / total) * 100),
    desconocido: Math.round((distribucion.desconocido / total) * 100)
  };
}

/**
 * Determina si una historia tiene cobertura balanceada
 */
export function esHistoriaBalanceada(noticias, umbralMinimo = 2) {
  const distribucion = calcularDistribucionSesgo(noticias);
  const sesgosPresentes = [
    distribucion.izquierda,
    distribucion.centro,
    distribucion.derecha
  ].filter(valor => valor > 0);

  return sesgosPresentes.length >= umbralMinimo;
}

/**
 * Detecta "blind spots" - qué sesgos NO están cubriendo la historia
 */
export function detectarBlindSpots(noticias) {
  const distribucion = calcularDistribucionSesgo(noticias);
  const blindSpots = [];

  if (distribucion.izquierda === 0) {
    blindSpots.push({
      sesgo: 'izquierda',
      mensaje: 'Sin cobertura de medios de izquierda'
    });
  }
  if (distribucion.centro === 0) {
    blindSpots.push({
      sesgo: 'centro',
      mensaje: 'Sin cobertura de medios de centro'
    });
  }
  if (distribucion.derecha === 0) {
    blindSpots.push({
      sesgo: 'derecha',
      mensaje: 'Sin cobertura de medios de derecha'
    });
  }

  return blindSpots;
}

/**
 * Obtiene un color según el sesgo político
 */
export function getColorSesgo(sesgo) {
  const colores = {
    izquierda: 'border-blue-500',
    centro: 'border-purple-500',
    derecha: 'border-red-500',
    desconocido: 'border-slate-500'
  };
  return colores[sesgo] || colores.desconocido;
}

/**
 * Obtiene un badge de credibilidad
 */
export function getBadgeCredibilidad(credibilidad) {
  const badges = {
    alta: { text: 'Alta Credibilidad', color: 'bg-green-500/10 text-green-500' },
    media: { text: 'Credibilidad Media', color: 'bg-yellow-500/10 text-yellow-500' },
    baja: { text: 'Verificar Fuente', color: 'bg-red-500/10 text-red-500' },
    desconocida: { text: 'Sin Clasificar', color: 'bg-slate-500/10 text-slate-500' }
  };
  return badges[credibilidad] || badges.desconocida;
}

/**
 * Analiza la diversidad de fuentes
 */
export function analizarDiversidadFuentes(noticias) {
  const mediosUnicos = new Set(noticias.map(n => n.medio_nombre || n.medio_nombre_backup));
  const distribucion = calcularDistribucionSesgo(noticias);
  const balanceada = esHistoriaBalanceada(noticias);
  const blindSpots = detectarBlindSpots(noticias);

  return {
    totalFuentes: mediosUnicos.size,
    distribucion,
    balanceada,
    blindSpots,
    calificacion: calcularCalificacionDiversidad(distribucion, mediosUnicos.size)
  };
}

/**
 * Calcula una calificación de diversidad (0-100)
 */
function calcularCalificacionDiversidad(distribucion, totalFuentes) {
  let puntuacion = 0;

  // Puntos por cantidad de fuentes
  puntuacion += Math.min(totalFuentes * 10, 40);

  // Puntos por balance político
  const sesgosPresentes = [
    distribucion.izquierda,
    distribucion.centro,
    distribucion.derecha
  ].filter(v => v > 0).length;
  
  puntuacion += sesgosPresentes * 20;

  // Penalización por sesgo dominante (>60%)
  const maxSesgo = Math.max(
    distribucion.izquierda,
    distribucion.centro,
    distribucion.derecha
  );
  
  if (maxSesgo > 60) {
    puntuacion -= 10;
  }

  return Math.min(Math.max(puntuacion, 0), 100);
}

/**
 * Genera un resumen de análisis para mostrar al usuario
 */
export function generarAnalisisCobertura(noticias) {
  const analisis = analizarDiversidadFuentes(noticias);
  
  let mensaje = `Esta historia tiene ${analisis.totalFuentes} ${analisis.totalFuentes === 1 ? 'fuente' : 'fuentes'}. `;
  
  if (analisis.balanceada) {
    mensaje += 'La cobertura es balanceada con representación del espectro político. ';
  } else {
    mensaje += 'La cobertura muestra sesgo hacia ciertos medios. ';
  }

  if (analisis.blindSpots.length > 0) {
    mensaje += `Puntos ciegos: ${analisis.blindSpots.map(b => b.mensaje).join(', ')}.`;
  }

  return {
    mensaje,
    calificacion: analisis.calificacion,
    nivel: analisis.calificacion >= 70 ? 'alta' : analisis.calificacion >= 40 ? 'media' : 'baja'
  };
}
