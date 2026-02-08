"use client";

import { useMemo, useState } from "react";
import FeedTiempoReal from "./FeedTiempoReal";
import TramasActivas from "./TramasActivas";
import DetalleHistoria from "./DetalleHistoria"; // Importa el nuevo componente

export default function HistoriasFeedClient({
  historiasIniciales = [],
  feedInicial = [],
}) {
  const [seleccionada, setSeleccionada] = useState(null);

  const listaHistorias = useMemo(() => {
    return Array.isArray(historiasIniciales) ? historiasIniciales : [];
  }, [historiasIniciales]);

  // FILTRADO DE NOTICIAS PARA EL DETALLE
  const noticiasAsociadas = useMemo(() => {
    if (!seleccionada) return [];
    return Array.isArray(feedInicial)
      ? feedInicial.filter((n) => n.historia_id === seleccionada.id)
      : [];
  }, [seleccionada, feedInicial]);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-300 p-4 lg:p-8">
      <div className="w-[95%] mx-auto space-y-16">
        
        {seleccionada ? (
          // VISTA DETALLE: Se activa cuando hay una historia seleccionada
          <DetalleHistoria 
            historia={seleccionada} 
            noticias={noticiasAsociadas} 
            onBack={() => setSeleccionada(null)} 
          />
        ) : (
          // VISTA PRINCIPAL
          <>
            <TramasActivas historias={listaHistorias} onSelect={setSeleccionada} />
            <FeedTiempoReal feedInicial={feedInicial} />
          </>
        )}
        
      </div>
    </div>
  );
}