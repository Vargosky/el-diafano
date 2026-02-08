'use client';
import { useState } from 'react';

export default function HistoriasClient({ historiasIniciales }) {
  const [seleccionada, setSeleccionada] = useState(null);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {historiasIniciales.map((h) => (
          <div 
            key={h.id}
            onClick={() => setSeleccionada(h)}
            className="bg-[#12161f] border border-white/5 p-5 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all group shadow-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded font-bold uppercase">
                {h.noticias.length} Fuentes Asociadas
              </span>
              <span className="text-[10px] text-slate-600 font-mono">
                {new Date(h.fecha).toLocaleDateString('es-CL')}
              </span>
            </div>
            <h2 className="text-md font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
              {h.titulo_generado}
            </h2>
          </div>
        ))}
      </div>

      {/* MODAL DE DETALLE */}
      {seleccionada && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-[#1a1f29] border-b border-white/5 flex justify-between items-start">
              <h2 className="text-lg font-bold text-white leading-tight pr-8">{seleccionada.titulo_generado}</h2>
              <button onClick={() => setSeleccionada(null)} className="text-slate-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {seleccionada.noticias.map((n) => (
                <div key={n.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[9px] text-blue-400 font-black uppercase mb-1">{n.medio}</p>
                    <p className="text-xs text-slate-200 font-medium">{n.titulo}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-[8px] text-slate-600 font-bold uppercase">Distancia</p>
                    <p className="text-sm font-mono font-black text-green-400">{parseFloat(n.distancia).toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}