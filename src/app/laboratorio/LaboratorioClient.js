'use client';
import { useState, useMemo } from 'react';

export default function LaboratorioClient({ datosIniciales = [] }) {
  const [filtroMetodo, setFiltroMetodo] = useState('Vector Puro'); // 'Vector Puro' | 'Tags' | 'Hibrido'
  const [filtroCalidad, setFiltroCalidad] = useState('Todos'); 
  const [matchSeleccionado, setMatchSeleccionado] = useState(null);

  // --- LA MAGIA HÍBRIDA (CÁLCULO AUTOMÁTICO) ---
  const datosProcesados = useMemo(() => {
    // 1. Separamos las listas crudas
    const listaVectores = datosIniciales.filter(d => d.metodo_usado?.toLowerCase().includes('vector'));
    const listaTags = datosIniciales.filter(d => d.metodo_usado?.toLowerCase().includes('tags'));

    // 2. Calculamos la INTERSECCIÓN (La Magia)
    // Buscamos pares que existan en AMBAS listas (mismo input_id y mismo candidate_id)
    const listaHibridaCalculada = listaVectores.filter(vItem => {
      return listaTags.some(tItem => 
        tItem.noticia_input_id === vItem.noticia_input_id && 
        tItem.historia_candidata_id === vItem.historia_candidata_id
      );
    }).map(item => ({ ...item, metodo_usado: 'HIBRIDO (CONFIRMADO)' }));

    return { vector: listaVectores, tags: listaTags, hibrido: listaHibridaCalculada };
  }, [datosIniciales]);


  // Lógica de Filtrado para la Vista
  const datosVisibles = (() => {
    let dataset = [];
    if (filtroMetodo === 'Vector Puro') dataset = datosProcesados.vector;
    else if (filtroMetodo === 'Tags') dataset = datosProcesados.tags;
    else if (filtroMetodo === 'Híbrido') dataset = datosProcesados.hibrido;

    // Filtro Calidad (Verde/Rojo)
    if (filtroCalidad === 'Aprobados') return dataset.filter(d => d.score < 0.25);
    if (filtroCalidad === 'Descartados') return dataset.filter(d => d.score >= 0.25);
    return dataset;
  })();

  const getColorCalidad = (score) => {
    if (score < 0.18) return 'border-green-500/50 hover:border-green-400 bg-green-500/[0.02]';
    if (score < 0.35) return 'border-yellow-500/50 hover:border-yellow-400 bg-yellow-500/[0.02]';
    return 'border-red-500/50 hover:border-red-400 bg-red-500/[0.02]';
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-300 p-6 lg:p-12 font-sans animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col gap-6 border-b border-white/5 pb-8">
          <div className="flex justify-between items-end">
             <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  🧪 Laboratorio <span className="text-slate-700 text-lg font-normal">v2.0</span>
                </h1>
                <p className="text-xs text-slate-500 mt-2 font-mono">Auditoría algorítmica y detección de consenso</p>
             </div>
             <div className="hidden md:block text-right">
                <span className="text-[10px] uppercase tracking-widest text-slate-500">Total Analizado</span>
                <p className="text-2xl font-black text-white">{datosIniciales.length}</p>
             </div>
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* SELECTOR DE MÉTODOS (TABS) */}
            <div className="flex bg-[#12161f] p-1.5 rounded-full border border-white/5 shadow-2xl">
              <button
                onClick={() => setFiltroMetodo('Vector Puro')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtroMetodo === 'Vector Puro' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'
                }`}
              >
                Vectores ({datosProcesados.vector.length})
              </button>
              
              <button
                onClick={() => setFiltroMetodo('Tags')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filtroMetodo === 'Tags' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-white'
                }`}
              >
                Tags ({datosProcesados.tags.length})
              </button>

              {/* EL BOTÓN MÁGICO HÍBRIDO */}
              <button
                onClick={() => setFiltroMetodo('Híbrido')}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  filtroMetodo === 'Híbrido' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20' 
                    : 'text-slate-500 hover:text-amber-400'
                }`}
              >
                ★ Híbridos ({datosProcesados.hibrido.length})
              </button>
            </div>

            {/* FILTROS DE CALIDAD */}
            <div className="flex gap-2">
               {['Todos', 'Aprobados', 'Descartados'].map(f => (
                 <button 
                    key={f}
                    onClick={() => setFiltroCalidad(f)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold border transition-all uppercase ${
                      filtroCalidad === f ? 'bg-white text-black border-white' : 'border-white/10 text-slate-500 hover:text-white'
                    }`}
                 >
                   {f}
                 </button>
               ))}
            </div>

          </div>
        </header>

        {/* FEED DE RESULTADOS */}
        <div className="grid grid-cols-1 gap-3">
          {datosVisibles.length > 0 ? datosVisibles.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => setMatchSeleccionado(item)}
              className={`group bg-[#12161f] hover:bg-[#1a1f2b] p-4 rounded-xl border transition-all cursor-pointer relative ${getColorCalidad(item.score)}`}
            >
              {/* Etiqueta Híbrida Especial */}
              {filtroMetodo === 'Híbrido' && (
                <div className="absolute -top-2 -left-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg z-20">
                  ★ DOBLE CONFIRMACIÓN
                </div>
              )}

              <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Noticia A */}
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.medio_origen}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 leading-snug group-hover:text-blue-400 transition-colors">
                    {item.titulo_origen}
                  </h3>
                </div>

                {/* Score Central */}
                <div className="flex flex-col items-center justify-center min-w-[80px]">
                  <span className={`text-lg font-mono font-black ${item.score < 0.2 ? 'text-green-500' : 'text-slate-600'}`}>
                    {parseFloat(item.score).toFixed(3)}
                  </span>
                  <span className="text-[8px] uppercase text-slate-600 tracking-widest">Distancia</span>
                </div>

                {/* Noticia B */}
                <div className="flex-1 w-full text-right md:text-left">
                  <div className="flex items-center justify-end md:justify-start gap-2 mb-1">
                     <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.medio_candidato}</span>
                     <span className="text-[9px] font-black text-slate-600 bg-white/5 px-1.5 rounded">EXISTENTE</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-400 italic leading-snug">
                    "{item.titulo_candidato}"
                  </h3>
                </div>

              </div>
            </div>
          )) : (
            <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
              <div className="text-4xl mb-4">👻</div>
              <p className="text-sm text-slate-500 font-medium">No se encontraron resultados en esta categoría.</p>
              {filtroMetodo === 'Híbrido' && (
                <p className="text-xs text-orange-500/70 mt-2 max-w-md mx-auto">
                  Para ver resultados híbridos, el algoritmo de Vectores y el de Tags deben coincidir en la misma pareja de noticias.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETALLE (Simplificado para código limpio) */}
      {matchSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" onClick={() => setMatchSeleccionado(null)}>
          <div className="bg-[#0b0e14] border border-white/10 w-full max-w-3xl rounded-2xl shadow-2xl p-8 space-y-8" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xl font-black text-white uppercase">Inspección de Match</h2>
                <div className="font-mono text-green-400 text-xl font-bold">{parseFloat(matchSeleccionado.score).toFixed(5)}</div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <img src={matchSeleccionado.img_origen} className="aspect-video w-full object-cover rounded-lg mb-4 opacity-80" />
                  <h3 className="font-bold text-white text-lg">{matchSeleccionado.titulo_origen}</h3>
                </div>
                <div>
                  <img src={matchSeleccionado.img_candidato} className="aspect-video w-full object-cover rounded-lg mb-4 opacity-50 grayscale" />
                  <h3 className="font-bold text-slate-400 text-lg italic">{matchSeleccionado.titulo_candidato}</h3>
                </div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}