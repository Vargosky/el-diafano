// lib/queries/personajes.js

export async function getTopPersonajes(supabase) {
  const { data, error } = await supabase.rpc('get_top_personajes');
  if (error) {
    console.error('[getTopPersonajes]', error.message);
    return [];
  }
  return data || [];
}

export async function getPersonajeBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from('personajes')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single();

  if (error) {
    console.error('[getPersonajeBySlug]', error.message);
    return null;
  }
  return data;
}

export async function getAllPersonajesActivos(supabase) {
  const { data, error } = await supabase
    .from('personajes')
    .select('id, nombre, slug, cargo, partido, foto_url')
    .eq('activo', true)
    .order('nombre');

  if (error) {
    console.error('[getAllPersonajesActivos]', error.message);
    return [];
  }
  return data || [];
}
