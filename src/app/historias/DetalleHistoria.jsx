// DetalleHistoria.jsx
"use client";

export default function DetalleHistoria({ historia, noticias, onBack }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <button 
            onClick={onBack}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-2 flex items-center gap-2"
          >
            ← Volver al feed
          </button>
          <h1 className="text-3xl font-bold text-white leading-tight">
            {historia.titulo_generado}
          </h1>
          <div className="flex gap-2 mt-3">
            {historia.tags?.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-slate-800 text-xs rounded uppercase tracking-wider text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-500 uppercase tracking-widest">ID Historia</p>
          <p className="text-xl font-mono text-slate-300">#{historia.id}</p>
        </div>
      </div>

      {/* LISTA DE NOTICIAS ASOCIADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {noticias.map((noticia) => (
          <div key={noticia.id} className="bg-[#161b22] border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 transition-all">
            {noticia.imagen_url && (
              <img src={noticia.imagen_url} alt="" className="w-full h-40 object-cover opacity-80" />
            )}
            <div className="p-4 space-y-3">
              <p className="text-xs font-bold text-blue-500 uppercase">{noticia.medio_nombre_backup || 'Medio desconocido'}</p>
              <h3 className="text-lg font-semibold text-slate-200 line-clamp-3 leading-snug">
                {noticia.titulo}
              </h3>
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500">{new Date(noticia.created_at).toLocaleString()}</span>
                <a 
                  href={noticia.link} 
                  target="_blank" 
                  className="text-xs bg-slate-800 px-3 py-1 rounded-full hover:bg-slate-700"
                >
                  Leer fuente
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}