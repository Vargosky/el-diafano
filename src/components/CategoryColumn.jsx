import Link from 'next/link';
import BiasBar from './BiasBar';

export default function CategoryColumn({ title, stories, color = 'blue' }) {
  const colorClasses = {
    green: 'bg-green-700',
    blue: 'bg-blue-700',
    red: 'bg-red-700',
    orange: 'bg-orange-600'
  };

  const bgColor = colorClasses[color] || colorClasses.blue;

  if (!stories || stories.length === 0) {
    return (
      <div>
        <div className={`${bgColor} text-white px-4 py-2 font-bold text-sm uppercase mb-4`}>
          {title}
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          No hay historias recientes
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={`${bgColor} text-white px-4 py-2 font-bold text-sm uppercase mb-4`}>
        {title}
      </div>

      {/* Lista de historias */}
      <div className="space-y-4">
        {stories.map((story) => (
          <Link 
            key={story.id} 
            href={`/historia/${story.id}`}
            className="block bg-white border border-gray-200 rounded p-3 hover:shadow-md transition-shadow"
          >
            {/* Título */}
            <h3 className="font-serif font-bold text-sm text-gray-900 mb-2 leading-tight hover:text-blue-600">
              {story.titulo_generado}
            </h3>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <span>{story.total_medios} medios</span>
              <span>•</span>
              <span>{story.total_noticias} artículos</span>
            </div>

            {/* BiasBar mini */}
            <BiasBar 
              izquierda={story.sesgo_izquierda || 0}
              centro_izq={story.sesgo_centro_izq || 0}
              centro={story.sesgo_centro || 0}
              centro_der={story.sesgo_centro_der || 0}
              derecha={story.sesgo_derecha || 0}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
