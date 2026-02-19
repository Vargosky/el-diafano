// lib/queries/stats.js

export async function getCategoryStats(supabase) {
  const { data, error } = await supabase.rpc('get_category_stats');
  if (error) {
    console.error('[getCategoryStats]', error.message);
    return [];
  }
  return data || [];
}

export async function getSesgosDelDia(supabase, fechaStr) {
  const { data, error } = await supabase
    .from('noticias')
    .select('sesgo_ia')
    .gte('fecha', `${fechaStr}T00:00:00+00:00`)
    .lte('fecha', `${fechaStr}T23:59:59+00:00`)
    .not('sesgo_ia', 'is', null);

  if (error) {
    console.error('[getSesgosDelDia]', error.message);
    return {};
  }

  return (data || []).reduce((acc, n) => {
    const s = n.sesgo_ia?.toLowerCase() || 'desconocido';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
}
