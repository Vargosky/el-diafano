/**
 * lib/queries/historias.js
 * Toda la logica de fetch, filtrado y ordenamiento de historias.
 */

// ─── Normalizacion ────────────────────────────────────────────────────────────

function normalizarArchivo(h) {
  return {
    ...h,
    total_noticias:   h.noticias_procesadas_count || h.conteo || 0,
    total_medios:     0,
    sesgo_izquierda:  0,
    sesgo_centro_izq: 0,
    sesgo_centro:     0,
    sesgo_centro_der: 0,
    sesgo_derecha:    0,
  };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getHistoriasHoy(supabase) {
  const { data, error } = await supabase.rpc('get_stories_with_bias', {
    dias_atras: 2,
    limite:     100,
  });
  if (error) {
    console.error('[getHistoriasHoy]', error.message);
    return [];
  }
  return filtrarFuturas(data || []);
}

export async function getHistoriasArchivo(supabase, fechaStr) {
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
    console.error('[getHistoriasArchivo]', error.message);
    return [];
  }
  return (data || []).map(normalizarArchivo);
}

export async function getHistoriaById(supabase, id) {
  const { data, error } = await supabase
    .from('historias')
    .select(`
      id, titulo_generado, resumen_ia, categoria, categoria_ia,
      peso_relevancia, tags, fecha, conteo, noticias_procesadas_count,
      noticias!historia_final_id (
        id, titulo, resumen_ia, sesgo_ia, tono_ia, imagen_url, link, fecha,
        medios ( id, nombre, sesgo_politico, logo_url, sitio_web )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getHistoriaById]', error.message);
    return null;
  }
  return data;
}

export async function getActiveDates(supabase, desde = '2024-01-01') {
  const { data, error } = await supabase
    .from('historias')
    .select('fecha')
    .gte('fecha', `${desde}T00:00:00+00:00`);

  if (error) {
    console.error('[getActiveDates]', error.message);
    return [];
  }
  return [...new Set((data || []).map(h => h.fecha?.slice(0, 10)).filter(Boolean))];
}

// ─── Filtros ──────────────────────────────────────────────────────────────────

function filtrarFuturas(historias) {
  const ahora = Date.now();
  return historias.filter(h => h.fecha && new Date(h.fecha).getTime() <= ahora);
}

export function filtrarPorCategoria(historias, categoria, limite = 6) {
  return historias
    .filter(h => h.categoria_ia === categoria)
    .sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    })
    .slice(0, limite);
}

// ─── Ordenamiento por tab ─────────────────────────────────────────────────────

const CATEGORIAS_COLUMNA = ['Economia', 'Politica', 'Economía', 'Política'];

export function ordenarPorTab(historias, tab) {
  const arr = [...historias];

  if (tab === 'todas') {
    return arr
      .sort((a, b) => {
        if (b.total_medios   !== a.total_medios)   return b.total_medios   - a.total_medios;
        if (b.total_noticias !== a.total_noticias) return b.total_noticias - a.total_noticias;
        return (b.peso_relevancia || 0) - (a.peso_relevancia || 0);
      })
      .slice(0, 5);
  }

  if (tab === 'top') {
    return arr.sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return (b.total_noticias || 0) - (a.total_noticias || 0);
    });
  }

  if (tab === 'cobertura') {
    return arr.sort((a, b) => {
      if (b.total_medios !== a.total_medios) return b.total_medios - a.total_medios;
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }

  if (tab === 'recientes') {
    return arr.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  return arr;
}

/**
 * Prepara todos los datos que necesita page.js en una sola llamada.
 * Retorna: { historias, feed, politica, economia }
 */
export function prepararFeed(historias, tab) {
  const ordenadas = ordenarPorTab(historias, tab);

  const feed = ordenadas
    .filter(h => !['Economia', 'Politica', 'Economía', 'Política'].includes(h.categoria_ia))
    .slice(0, 5);

  const politica = filtrarPorCategoria(historias, 'Política');
  const economia = filtrarPorCategoria(historias, 'Economía');

  return { feed, politica, economia };
}
