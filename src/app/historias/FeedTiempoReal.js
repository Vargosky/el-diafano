"use client";

import { useMemo, useState } from "react";
import { NewsCard } from "./NewsCard"; // Asumiendo que guardaste el componente anterior

export default function FeedTiempoReal({ feedInicial = [] }) {
  const [filtroActivo, setFiltroActivo] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(18);

  // Definimos los filtros disponibles (Tendencias + Medios específicos)
  const filtrosDisponibles = useMemo(
    () => [
      "Todos",
      // Tendencias
      "Centro",
      "Izquierda",
      "Derecha",
      // Medios específicos
      "BioBio",
      "Emol",
      "Cooperativa",
      "ElSiglo",
      "CNN Chile",
    ],
    []
  );

  // --- LOGICA DE SESGO ---
  const detectarSesgo = (nombreMedio) => {
    const medio = String(nombreMedio || "").toLowerCase();
    // Definición de reglas de sesgo
    if (medio.includes("biobio") || medio.includes("cooperativa") || medio.includes("cnn")) return "Centro";
    if (medio.includes("emol")) return "Derecha";
    if (medio.includes("elsiglo")) return "Izquierda";
    return "Otro";
  };

  // --- PROCESAMIENTO: Asignar Sesgo, Filtrar y Ordenar ---
  const feedProcesado = useMemo(() => {
    if (!Array.isArray(feedInicial)) return [];

    // 1. Primero, enriquecemos la data con el sesgo (si no viene de la DB)
    let noticias = feedInicial.map((n) => ({
      ...n,
      linea_editorial: n.linea_editorial || detectarSesgo(n.medio_nombre_backup),
    }));

    // 2. FILTRADO
    if (filtroActivo !== "Todos") {
      // Verificamos si el filtro seleccionado es una categoría de sesgo (Izquierda, Centro, Derecha)
      const esFiltroDeSesgo = ["Centro", "Izquierda", "Derecha"].includes(filtroActivo);

      if (esFiltroDeSesgo) {
        // Filtrar por coincidencia exacta de sesgo
        noticias = noticias.filter((n) => n.linea_editorial === filtroActivo);
      } else {
        // Filtrar por nombre del medio (búsqueda parcial)
        noticias = noticias.filter((n) =>
          String(n.medio_nombre_backup || "")
            .toLowerCase()
            .includes(filtroActivo.toLowerCase())
        );
      }
    }

    // 3. ORDENAMIENTO (Prioridad Centro, luego cronológico)
    // Solo aplicamos la prioridad visual si estamos viendo "Todos" o medios mezclados.
    // Si el usuario ya filtró por "Izquierda", no tiene sentido ordenar por "Centro".
    if (filtroActivo === "Todos" || !["Centro", "Izquierda", "Derecha"].includes(filtroActivo)) {
      noticias.sort((a, b) => {
        const esCentroA = a.linea_editorial === "Centro";
        const esCentroB = b.linea_editorial === "Centro";

        if (esCentroA && !esCentroB) return -1; // Centro va primero
        if (!esCentroA && esCentroB) return 1;  // No-Centro va después
        return 0; // Si son iguales, mantenemos orden original (cronológico)
      });
    }

    return noticias;
  }, [feedInicial, filtroActivo]);

  // PAGINACIÓN
  const noticiasVisibles = feedProcesado.slice(0, visibleCount);

  const handleCargarMas = () => {
    setVisibleCount((prev) => prev + 9);
  };

  return (
    <section className="space-y-8 mt-32 border-t border-white/5 pt-16">
      {/* Encabezado del Feed */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-6 gap-6">
        <div>
          <h2 className="text-xs font-black text-slate-500 tracking-[0.4em] uppercase mb-2">
            Feed Tiempo Real
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
             {filtroActivo === "Todos" 
               ? "Prioridad editorial: Centro • Orden Cronológico" 
               : `Filtrando por: ${filtroActivo}`}
          </p>
        </div>

        {/* Botonera de Filtros */}
        <div className="flex gap-2 flex-wrap justify-start md:justify-end">
          {filtrosDisponibles.map((filtro) => {
            // Estilo visual distinto para las tendencias políticas vs medios
            const esTendencia = ["Centro", "Izquierda", "Derecha"].includes(filtro);
            
            return (
              <button
                key={filtro}
                onClick={() => {
                  setFiltroActivo(filtro);
                  setVisibleCount(18);
                }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border transition-all ${
                  filtroActivo === filtro
                    ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    : "border-white/10 text-slate-500 hover:text-white hover:border-white/30"
                } ${esTendencia && filtroActivo !== filtro ? "border-blue-500/30 text-blue-400/70" : ""}`}
              >
                {filtro}
              </button>
            );
          })}
        </div>
      </div>

      {/* GRILLA DE NOTICIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {noticiasVisibles.map((n) => (
          <NewsCard key={n.id} noticia={n} />
        ))}
      </div>

      {/* Botón Cargar Más */}
      {visibleCount < feedProcesado.length && (
        <div className="flex justify-center pt-12 pb-20">
          <button
            onClick={handleCargarMas}
            className="group px-8 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3"
          >
            <span>Cargar más noticias</span>
            <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
          </button>
        </div>
      )}

      {/* Mensaje vacío */}
      {feedProcesado.length === 0 && (
        <div className="text-center py-20 text-slate-600 border border-dashed border-white/10 rounded-2xl">
          No se encontraron noticias para: <span className="text-slate-400 font-bold">{filtroActivo}</span>.
        </div>
      )}
    </section>
  );
}