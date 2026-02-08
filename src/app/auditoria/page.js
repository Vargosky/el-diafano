import { getHistoriasAgrupadas } from '@/lib/data';
import Link from 'next/link';
import HistoriasClient from './HistoriasClient';

// Forzamos que Next.js no use caché para ver las actualizaciones de n8n al instante
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AuditoriaPage() {
  // 1. Obtenemos los datos desde el servidor (PostgreSQL)
  const historias = await getHistoriasAgrupadas();

  return (
    <main className="min-h-screen bg-[#0b0e14] text-slate-300 p-6 font-sans">
      {/* HEADER SUPERIOR */}
      <header className="max-w-5xl mx-auto mb-10 border-b border-white/5 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Explorador de <span className="text-blue-500">Historias</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
            Agrupamiento por Similitud Vectorial // Einsoft Engine
          </p>
        </div>
        
        <Link 
          href="/" 
          className="text-[10px] font-bold text-slate-400 hover:text-white px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all uppercase tracking-widest"
        >
          ← Volver
        </Link>
      </header>

      {/* 2. Verificamos si hay datos y los pasamos al componente interactivo */}
      {historias && historias.length > 0 ? (
        <HistoriasClient historiasIniciales={historias} />
      ) : (
        <div className="max-w-5xl mx-auto py-20 text-center border border-dashed border-white/10 rounded-3xl bg-[#12161f]/50">
          <div className="text-4xl mb-4 opacity-20">📡</div>
          <p className="text-slate-500 text-sm font-medium italic">
            No se encontraron historias agrupadas en la base de datos.
          </p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2">
            Asegúrate de que el flujo de n8n haya procesado las noticias.
          </p>
        </div>
      )}
    </main>
  );
}