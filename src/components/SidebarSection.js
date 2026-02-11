// src/components/SidebarSection.js
import Link from 'next/link';

export default function SidebarSection({ title, color, stories }) {
  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-300 pb-6">
      <h2 className={`${color} text-white text-center py-1 text-xs font-bold uppercase mb-4 font-sans`}>
        {title}
      </h2>

      <div className="space-y-4">
        {stories.map((story) => (
          <div key={story.id} className="border-b border-gray-200 pb-3 last:border-0">
            <Link href={`/historia/${story.id}`}>
              <h3 className="font-bold text-sm leading-snug hover:text-blue-700 transition-colors cursor-pointer mb-1">
                {story.titulo_generado}
              </h3>
            </Link>

            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-sans mt-1">
              <span>{story.total_medios} medios</span>
              <span>•</span>
              <span>{story.total_noticias} artículos</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}