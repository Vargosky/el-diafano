import Link from 'next/link';

export default function StoryCard({ story }) {
  return (
    // bg-bone es el color hueso definido en el CSS
    <div className="group border-b border-sepia-border bg-bone p-6 transition-all hover:bg-[#f4f1ea]/50">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        
        {/* Lado Izquierdo: Título y Tags */}
        <div className="flex-1">
          <Link href={`/historia/${story.id}`}>
            <h2 className="cursor-pointer text-xl font-serif font-bold leading-snug text-gray-900 group-hover:text-blue-700 decoration-blue-500/30 hover:underline">
              {story.titulo_generado}
            </h2>
          </Link>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {story.tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="rounded bg-[#e6e2d9] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#65615a]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Lado Derecho: Métricas y Hora */}
        <div className="flex shrink-0 flex-col items-end">
          {/* Badge de Cobertura */}
          <div className="flex items-center gap-1.5 rounded-sm border border-[#e6e2d9] bg-[#f7f4ed] px-3 py-1 text-blue-700 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {story.total_noticias || 0} Artículos
            </span>
            <span className="text-[#a39e93]">|</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {story.total_medios || 0} Medios
            </span>
          </div>

          {/* Hora de publicación */}
          <span className="mt-2 text-[10px] font-medium text-[#a39e93] uppercase tracking-widest">
            {story.fecha ? new Date(story.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
        </div>

      </div>
    </div>
  );
}