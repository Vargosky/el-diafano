// lib/queries/busqueda.js

// ─── Select base (sin joins que fallen) ──────────────────────────────────────

const SELECT_HISTORIA = `
  id, titulo_generado, resumen_ia, categoria_ia,
  peso_relevancia, conteo, tags, fecha,
  noticias_procesadas_count
`;

// ─── Normalizador ─────────────────────────────────────────────────────────────

function normalizar(h, medios = []) {
  return {
    ...h,
    total_noticias: h.noticias_procesadas_count || h.conteo || 0,
    medios_unicos:  medios,
  };
}

// ─── Medios de una historia ───────────────────────────────────────────────────
// Query separada para evitar el problema del schema cache con foreign keys

async function getMediosDeHistoria(supabase, historiaId) {
  const { data, error } = await supabase
    .from('noticias')
    .select('medio_id, medios ( id, nombre, sesgo_politico, logo_url )')
    .eq('historia_final_id', historiaId)
    .not('medio_id', 'is', null);

  if (error) {
    console.warn('[getMediosDeHistoria]', error.message);
    return [];
  }

  const map = new Map();
  (data || []).forEach(n => {
    if (n.medios && !map.has(n.medios.id)) map.set(n.medios.id, n.medios);
  });
  return [...map.values()];
}

async function enriquecerConMedios(supabase, historias) {
  return Promise.all(
    historias.map(async h => {
      const medios = await getMediosDeHistoria(supabase, h.id);
      return normalizar(h, medios);
    })
  );
}

// ─── Por ID ───────────────────────────────────────────────────────────────────

export async function buscarPorId(supabase, id) {
  const numeric = parseInt(id, 10);
  if (isNaN(numeric)) return [];

  const { data, error } = await supabase
    .from('historias')
    .select(SELECT_HISTORIA)
    .eq('id', numeric)
    .single();

  if (error) { console.error('[buscarPorId]', error.message); return []; }
  if (!data)  return [];

  const medios = await getMediosDeHistoria(supabase, data.id);
  return [normalizar(data, medios)];
}

// ─── Por texto (titulo + resumen + tags) ──────────────────────────────────────

export async function buscarPorTexto(supabase, query, limite = 20) {
  const q = query.trim();
  if (q.length < 2) return [];

  const [{ data: dataTitulo, error: e1 }, { data: dataTags, error: e2 }] = await Promise.all([
    supabase
      .from('historias')
      .select(SELECT_HISTORIA)
      .or(`titulo_generado.ilike.%${q}%,resumen_ia.ilike.%${q}%`)
      .order('peso_relevancia', { ascending: false })
      .limit(limite),

    supabase
      .from('historias')
      .select(SELECT_HISTORIA)
      .contains('tags', [q.toLowerCase()])
      .order('peso_relevancia', { ascending: false })
      .limit(limite),
  ]);

  if (e1) console.warn('[buscarPorTexto titulo]', e1.message);
  if (e2) console.warn('[buscarPorTexto tags]',   e2.message);

  const combinados = [...(dataTitulo || []), ...(dataTags || [])];
  const unicos = Array.from(new Map(combinados.map(h => [h.id, h])).values())
    .slice(0, limite);

  return enriquecerConMedios(supabase, unicos);
}

// ─── Por medio ────────────────────────────────────────────────────────────────

export async function buscarPorMedio(supabase, medioId, limite = 20) {
  const { data, error } = await supabase
    .from('noticias')
    .select('historia_final_id')
    .eq('medio_id', medioId)
    .not('historia_final_id', 'is', null)
    .limit(limite * 3);

  if (error) { console.error('[buscarPorMedio]', error.message); return []; }

  const ids = [...new Set((data || []).map(n => n.historia_final_id))].slice(0, limite);
  if (ids.length === 0) return [];

  const { data: historias, error: e2 } = await supabase
    .from('historias')
    .select(SELECT_HISTORIA)
    .in('id', ids)
    .order('peso_relevancia', { ascending: false });

  if (e2) { console.error('[buscarPorMedio historias]', e2.message); return []; }

  return enriquecerConMedios(supabase, historias || []);
}

// ─── Semantica (pgvector) ─────────────────────────────────────────────────────
// Requiere RPC 'match_historias'. Si no existe, falla silenciosamente.

export async function buscarSemantica(supabase, embedding, limite = 20) {
  if (!embedding) return [];
  const { data, error } = await supabase.rpc('match_historias', {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count:     limite,
  });
  if (error) { console.warn('[buscarSemantica] RPC no disponible:', error.message); return []; }
  return enriquecerConMedios(supabase, data || []);
}

// ─── Busqueda unificada ───────────────────────────────────────────────────────

export async function buscar(supabase, query, limite = 20) {
  const q = (query || '').trim();
  if (!q) return { resultados: [], tipo: null, query: q };

  // ID exacto
  if (/^\d+$/.test(q)) {
    const porId = await buscarPorId(supabase, q);
    if (porId.length > 0) return { resultados: porId, tipo: 'id', query: q };
  }

  // Texto simple
  const porTexto = await buscarPorTexto(supabase, q, limite);
  return {
    resultados:       porTexto,
    tipo:             porTexto.length > 0 ? 'texto' : 'sin_resultados',
    query:            q,
    sugerirSemantica: porTexto.length < 3,
  };
}

// ─── Medios para el selector ──────────────────────────────────────────────────

export async function getMedios(supabase) {
  const { data, error } = await supabase
    .from('medios')
    .select('id, nombre, slug, sesgo_politico, logo_url')
    .order('nombre');

  if (error) { console.error('[getMedios]', error.message); return []; }
  return data || [];
}