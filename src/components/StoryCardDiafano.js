// src/components/StoryCardDiafano.js
import Link from 'next/link';

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    return tags
      .replace(/[{}"]/g, "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

export default function StoryCardDiafano({ story }) {
  const tags = normalizeTags(story.tags);

  return (
    <article className="mb-12 border-b border-gray-200 pb-8 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="bg-gray-200 text-[10px] font-sans font-bold uppercase px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <span className="text-blue-600 font-sans text-[10px] font-bold border border-blue-600 px-2 py-1 rounded whitespace-nowrap">
          {story.total_noticias} ARTÍCULOS | {story.total_medios} MEDIOS
        </span>
      </div>

      <Link href={`/historia/${story.id}`}>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4 hover:text-blue-800 transition-colors cursor-pointer">
          {story.titulo_generado}
        </h2>
      </Link>

      <p className="text-gray-700 leading-relaxed text-md mb-4 line-clamp-3">
        {story.resumen_ia || "Sin resumen disponible."}
      </p>

      <div className="flex justify-end text-[10px] font-sans text-gray-400 font-bold uppercase">
        {story.fecha
          ? new Date(story.fecha).toLocaleTimeString("es-CL", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
      </div>
    </article>
  );
}