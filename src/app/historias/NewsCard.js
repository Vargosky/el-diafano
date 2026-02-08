import Link from "next/link";

export const NewsCard = ({ noticia }) => {
  // Función auxiliar para tiempo relativo (interna del componente)
  const getRelativo = (fecha) => {
    if (!fecha) return "";
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 60) return `${diff} min`;
    const horas = Math.floor(diff / 60);
    return horas < 24 ? `${horas}h` : `${Math.floor(horas / 24)}d`;
  };

  return (
    <article className="bg-[#11141d] p-5 rounded-[1.5rem] border border-white/5 hover:bg-[#161b26] hover:border-blue-500/30 transition-all flex flex-col group h-full">
      {/* Imagen */}
      <div className="aspect-video relative rounded-xl overflow-hidden bg-slate-900 mb-4 shadow-inner">
        <img
          src={
            noticia.imagen_url ||
            "https://via.placeholder.com/800x600?text=Sin+Imagen"
          }
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          loading="lazy"
          alt="Noticia"
        />
        
        {/* Badge del Medio */}
        <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-sm text-white text-[9px] font-black uppercase rounded-full border border-white/10 z-10">
          {noticia.medio_nombre_backup}
        </div>

        {/* Badge de Sesgo (Opcional, para visualizar que funciona la lógica) */}
        {noticia.linea_editorial && (
           <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-blue-600/80 backdrop-blur-sm text-white text-[8px] font-bold uppercase rounded-md border border-white/10">
             {noticia.linea_editorial}
           </div>
        )}
      </div>

      {/* Título */}
      <h4 className="text-sm font-bold text-slate-200 mb-3 leading-snug group-hover:text-blue-400 transition-colors line-clamp-3">
        <Link
          href={noticia.link}
          target="_blank"
          className="hover:underline decoration-blue-500/50 underline-offset-4"
        >
          {noticia.titulo}
        </Link>
      </h4>

      {/* Footer de tarjeta */}
      <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5 text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-green-500 transition-colors"></span>
          {getRelativo(noticia.created_at)}
        </span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 font-bold">
          LEER →
        </span>
      </div>
    </article>
  );
};