import React from 'react'
import Link from 'next/link';

export const Link_laboratorio = () => {
  return (
    <div className="flex justify-end px-6 py-4">
  <Link href="/laboratorio">
    <button className="group relative px-6 py-2 rounded-full bg-slate-900 border border-white/10 hover:border-blue-500/50 transition-all overflow-hidden">
      <div className="absolute inset-0 bg-blue-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="relative flex items-center gap-2 text-xs font-black text-slate-400 group-hover:text-blue-400 uppercase tracking-widest">
        🧪 Ir al Laboratorio
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      </span>
    </button>
  </Link>
</div>
  )
}

