"use client";

import { useMemo, useState } from "react";
import HistoriaCard from "./HistoriaCard";

export default function TramasActivas({
  historias = [],
  onSelect,
  titulo = "Tramas Activas",
  inicial = 9,      // cantidad inicial
  paso = 9,         // cuánto aumenta por click
}) {
  const [limite, setLimite] = useState(inicial);

  const listaBruta = Array.isArray(historias) ? historias : [];

  const listaUnica = useMemo(() => {
    const mapa = new Map();
    listaBruta.forEach((h) => {
      if (h?.id != null && !mapa.has(h.id)) mapa.set(h.id, h);
    });
    return Array.from(mapa.values());
  }, [listaBruta]);

  const visibles = useMemo(() => {
    return listaUnica.slice(0, limite);
  }, [listaUnica, limite]);

  const hayMas = limite < listaUnica.length;

  return (
    <section className="space-y-6 mt-20">
      <div className="flex justify-between items-center border-b border-blue-500/30 pb-3">
        <h2 className="text-xs font-black text-blue-400 tracking-[0.6em] uppercase">
          {titulo}
        </h2>

        <span className="text-[10px] text-slate-500 font-mono bg-blue-500/5 px-2 py-1 rounded-full border border-blue-500/10">
          Mostrando: {visibles.length} / Total: {listaUnica.length}
        </span>
      </div>

      {listaUnica.length === 0 ? (
        <div className="text-white/60 text-sm italic p-4 text-center border border-white/5 rounded-xl">
          No hay historias activas en este momento.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {visibles.map((h) => (
              <HistoriaCard key={h.id} h={h} onSelect={onSelect} />
            ))}
          </div>

          {/* BOTONES */}
          <div className="flex justify-center gap-3 pt-2">
            {hayMas && (
              <button
                type="button"
                onClick={() => setLimite((prev) => Math.min(prev + paso, listaUnica.length))}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase
                           bg-white text-black hover:bg-blue-300 transition"
              >
                Ver más
              </button>
            )}

            {limite > inicial && (
              <button
                type="button"
                onClick={() => setLimite(inicial)}
                className="px-4 py-2 rounded-full text-[10px] font-black uppercase
                           border border-white/15 text-white/70 hover:text-white hover:border-white/30 transition"
              >
                Ver menos
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
