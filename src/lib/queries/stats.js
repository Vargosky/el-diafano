// lib/queries/stats.js

export async function getCategoryStats(supabase) {
  const { data, error } = await supabase.rpc('get_category_stats');
  if (error) { console.error('[getCategoryStats]', error.message); return []; }
  return data || [];
}

export async function getNoticiasPorMedio(supabase, diasAtras = 7) {
  const desde = new Date();
  desde.setDate(desde.getDate() - diasAtras);

  // Paso 1: contar noticias por medio_id
  const { data: noticias, error: e1 } = await supabase
    .from('noticias')
    .select('medio_id')
    .gte('fecha', desde.toISOString())
    .not('medio_id', 'is', null);

  if (e1) { console.error('[getNoticiasPorMedio] noticias:', e1.message); return []; }

  // Agrupar y contar
  const conteo = new Map();
  (noticias || []).forEach(n => {
    conteo.set(n.medio_id, (conteo.get(n.medio_id) || 0) + 1);
  });

  if (conteo.size === 0) return [];

  // Paso 2: traer info de los medios
  const ids = [...conteo.keys()];
  const { data: medios, error: e2 } = await supabase
    .from('medios')
    .select('id, nombre, sesgo_politico')
    .in('id', ids);

  if (e2) { console.error('[getNoticiasPorMedio] medios:', e2.message); return []; }

  // Combinar
  return (medios || [])
    .map(m => ({ ...m, total: conteo.get(m.id) || 0 }))
    .sort((a, b) => b.total - a.total);
}

export async function getSesgosDelDia(supabase, fechaStr) {
  const { data, error } = await supabase
    .from('noticias')
    .select('sesgo_ia')
    .gte('fecha', `${fechaStr}T00:00:00+00:00`)
    .lte('fecha', `${fechaStr}T23:59:59+00:00`)
    .not('sesgo_ia', 'is', null);

  if (error) { console.error('[getSesgosDelDia]', error.message); return {}; }

  return (data || []).reduce((acc, n) => {
    const s = n.sesgo_ia?.toLowerCase() || 'desconocido';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
}