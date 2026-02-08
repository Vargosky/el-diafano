'use client';
import { useState } from 'react';

export default function LaboratorioClient({ datosIniciales = [] }) {
  const [filtroMetodo, setFiltroMetodo] = useState('Vector Puro'); // 'Vector Puro' | 'Tags'
  const [filtroCalidad, setFiltroCalidad] = useState('Todos'); // 'Todos' | 'Aprobados' | 'Descartados'
  const [matchSeleccionado, setMatchSeleccionado] = useState(null);

  // Lógica de Filtrado Combinada (Método + Calidad)
  const datosFiltrados = datosIniciales.filter(d => {
    // 1. Filtro por Método (Vector vs Tags)
    const coincideMetodo = d.metodo_usado?.toLowerCase().includes(filtroMetodo.toLowerCase().split(' ')[0]);
    
    // 2. Filtro por Calidad (Score)
    let coincideCalidad = true;
    if (filtroCalidad === 'Aprobados') {
      coincideCalidad = d.score < 0.25; // Umbral de "Match Bueno" (Verdes/Amarillos fuertes)
    } else if (filtroCalidad === 'Descartados') {
      coincideCalidad = d.score >= 0.25; // Umbral de "No es Match" (Rojos)
    }

    return coincideMetodo && coincideCalidad;
  });

  // Función para determinar el color del borde según el score
  const getColorCalidad = (score) => {
    if (score < 0.18) return 'border-green-500/50 hover:border-green-400 bg-green-500/[0.02]';
    if (score < 0.35) return 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/[0.02]';
    return 'border-red-500/50 hover:border-red-400 bg-red-500/[0.02]';
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-300 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER & CONTROLES */}
        <header className="flex flex-col gap-6 border-b border-white/5 pb-8">
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">🧪 Laboratorio de Matching</h1>
                <p className="text-xs text-slate-500 mt-2 font-mono">Auditoría en tiempo real de algoritmos de agrupación</p>
             </div>
             <div className="text-right hidden md:block">
                <p className="text-xs text-slate-500 font-mono">Total Registros</p>
                <p className="text-xl font-bold text-white">{datosIniciales.length}</p>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* 1. TABS DE MÉTODOS (Izquierda) */}
            <div className="flex bg-white/[0.03] p-1 rounded-full border border-white/5">
              {['Vector Puro', 'Tags'].map((metodo) => (
                <button
                  key={metodo}
                  onClick={() => setFiltroMetodo(metodo)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroMetodo === metodo 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {metodo}
                </button>
              ))}
            </div>

            {/* 2. FILTROS DE CALIDAD (Derecha) */}
            <div className="flex gap-2">
               <button 
                  onClick={() => setFiltroCalidad('Todos')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filtroCalidad === 'Todos' ? 'bg-white text-black border-white' : 'border-white/10 text-slate-500 hover:text-white'}`}
               >
                 TODOS ({datosIniciales.filter(d => d.metodo_usado?.includes(filtroMetodo.split(' ')[0])).length})
               </button>
               <button 
                  onClick={() => setFiltroCalidad('Aprobados')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filtroCalidad === 'Aprobados' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'border-white/10 text-slate-500 hover:text-green-400'}`}
               >
                 VERDES
               </button>
               <button 
                  onClick={() => setFiltroCalidad('Descartados')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filtroCalidad === 'Descartados' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'border-white/10 text-slate-500 hover:text-red-400'}`}
               >
                 ROJOS
               </button>
            </div>

          </div>
        </header>

        {/* GRILLA DE RESULTADOS */}
        <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {datosFiltrados.length > 0 ? datosFiltrados.map((item) => (
            <div 
              key={item.id}
              onClick={() => setMatchSeleccionado(item)}
              className={`group bg-[#12161f] p-4 md:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${getColorCalidad(item.score)}`}
            >
              {/* Score Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-md ${item.score < 0.2 ? 'text-green-400' : 'text-red-400'}`}>
                  SCORE: {parseFloat(item.score).toFixed(4)}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Lado Izquierdo: Noticia Nueva */}
                <div className="flex-1 space-y-2 w-full">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Nueva Entrada
                  </span>
                  <h3 className="text-sm font-bold text-white leading-snug group-hover:text-blue-400 transition-colors">
                    {item.titulo_origen}
                  </h3>
                  <span className="text-[9px] text-slate-600 uppercase bg-white/5 px-2 py-0.5 rounded">{item.medio_origen}</span>
                </div>

                {/* Conector Visual */}
                <div className="text-slate-600 rotate-90 md:rotate-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right-left"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>
                </div>

                {/* Lado Derecho: Candidato */}
                <div className="flex-1 space-y-2 w-full text-center md:text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block md:hidden">Candidato</span>
                  <h3 className="text-sm font-medium text-slate-300 leading-snug italic">
                    "{item.titulo_candidato}"
                  </h3>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                     <span className="text-[9px] text-slate-600 uppercase bg-white/5 px-2 py-0.5 rounded">{item.medio_candidato}</span>
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:block"> ← Candidato</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <p className="text-sm font-medium">No hay resultados con estos filtros.</p>
              <button onClick={() => setFiltroCalidad('Todos')} className="mt-4 text-xs text-blue-500 hover:text-blue-400 hover:underline">Limpiar filtros</button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DETALLE (Igual que antes) */}
      {matchSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setMatchSeleccionado(null)}>
          <div className="bg-[#0b0e14] border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* Header Modal */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#12161f]">
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Análisis de Coincidencia</h2>
              <button onClick={() => setMatchSeleccionado(null)} className="text-slate-500 hover:text-white transition-colors">
                ✕ CERRAR
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Noticia A */}
              <div className="space-y-4">
                <span className="bg-blue-600/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-md uppercase border border-blue-500/20">Input (Nueva)</span>
                {matchSeleccionado.img_origen && (
                   <img src={matchSeleccionado.img_origen} className="w-full aspect-video object-cover rounded-xl opacity-80" />
                )}
                <h3 className="text-xl font-bold text-white">{matchSeleccionado.titulo_origen}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {matchSeleccionado.noticia_input_id} | {matchSeleccionado.medio_origen}</p>
              </div>

              {/* Noticia B */}
              <div className="space-y-4 relative">
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden md:block text-slate-700">👉</div>
                <span className="bg-white/5 text-slate-300 text-[10px] font-black px-3 py-1 rounded-md uppercase border border-white/10">Match Encontrado</span>
                {matchSeleccionado.img_candidato && (
                   <img src={matchSeleccionado.img_candidato} className="w-full aspect-video object-cover rounded-xl opacity-60 grayscale hover:grayscale-0 transition-all" />
                )}
                <h3 className="text-xl font-bold text-slate-300">{matchSeleccionado.titulo_candidato}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {matchSeleccionado.historia_candidata_id} | {matchSeleccionado.medio_candidato}</p>
              </div>

            </div>

            {/* Footer con Veredicto */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase text-slate-500 tracking-widest">Algoritmo</p>
                <p className="text-sm font-bold text-white">{matchSeleccionado.metodo_usado}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 tracking-widest">Distancia Vectorial</p>
                <p className={`text-2xl font-black font-mono ${matchSeleccionado.score < 0.2 ? 'text-green-500' : 'text-red-500'}`}>
                  {parseFloat(matchSeleccionado.score).toFixed(5)}
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}