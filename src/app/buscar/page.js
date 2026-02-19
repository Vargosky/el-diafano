// app/buscar/page.js
// Pagina de busqueda de historias.
// Solo renderiza — toda la logica esta en lib/queries/busqueda.js

import Header from '@/components/Header';
import SearchClient from '@/components/SearchClient';
import { createClient } from '@/lib/supabase';
import { buscar, buscarPorMedio, getMedios } from '@/lib/queries/busqueda';

export const dynamic = 'force-dynamic';

export default async function BuscarPage({ searchParams }) {
  const supabase = createClient();
  const params   = await searchParams;

  const query   = params?.q     || '';
  const medioId = params?.medio ? parseInt(params.medio, 10) : null;

  // Fetch en paralelo: medios siempre, resultados solo si hay query
  const [medios, resultado] = await Promise.all([
    getMedios(supabase),
    medioId
      ? buscarPorMedio(supabase, medioId).then(r => ({ resultados: r, tipo: 'medio', query: '' }))
      : query
        ? buscar(supabase, query)
        : Promise.resolve({ resultados: [], tipo: null, query: '' }),
  ]);

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      <SearchClient
        medios={medios}
        resultadosIniciales={resultado.resultados}
        tipoInicial={resultado.tipo}
        queryInicial={query}
        medioIdInicial={medioId}
      />
    </main>
  );
}
