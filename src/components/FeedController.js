import Link from 'next/link';
import BiasBar from './BiasBar';

export default function FeedController({ stories }) {
  if (!stories || stories.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        No hay historias disponibles
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {stories.map((story) => (
        <article
          key={story.id}
          className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header con badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="bg-blue-600 text-white px-2 py-1 text-xs font-mono font-bold rounded">
              #{story.id}
            </span>

            {story.tags && story.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-semibold uppercase rounded"
              >
                {tag}
              </span>
            ))}

            <span className="text-xs text-gray-500 w-full sm:w-auto sm:ml-auto mt-1 sm:mt-0">
              {story.total_noticias} articulos | {story.total_medios} medios
            </span>
          </div>

          {/* Titulo */}
          <Link href={`/historia/${story.id}`}>
            <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900 mb-3 leading-tight hover:text-blue-600 cursor-pointer">
              {story.titulo_generado}
            </h2>
          </Link>

          {/* Resumen */}
          {story.resumen_ia && (
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {story.resumen_ia}
            </p>
          )}

          {/* BiasBar */}
          <BiasBar
            izquierda={story.sesgo_izquierda || 0}
            centro_izq={story.sesgo_centro_izq || 0}
            centro={story.sesgo_centro || 0}
            centro_der={story.sesgo_centro_der || 0}
            derecha={story.sesgo_derecha || 0}
            total_noticias={story.total_noticias}
          />

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 text-xs">
            <span className="text-gray-500">
              Peso: {story.peso_relevancia?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-500">
              {new Date(story.fecha).toLocaleString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}