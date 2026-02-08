import { Pool } from 'pg';
import StoryCard from '@/components/StoryCard';

const pool = new Pool({
  user: 'n8n_user',
  host: 'localhost',
  database: 'ground_news_db',
  password: 'mi_password_segura_123',
  port: 5432,
});

async function fetchStories() {
  try {
    const res = await pool.query(`
      SELECT h.id, h.titulo_generado, h.fecha_primer_reporte as fecha, h.tags, h.resumen_ia,
      COUNT(n.id) as total_noticias
      FROM historias h
      LEFT JOIN noticias n ON n.historia_id = h.id
      GROUP BY h.id, h.titulo_generado, h.fecha_primer_reporte, h.tags, h.resumen_ia
      ORDER BY h.fecha_primer_reporte DESC LIMIT 20;
    `);
    return res.rows;
  } catch (e) { return []; }
}

export default async function Page() {
  const stories = await fetchStories();

  return (
    <div className="min-h-screen bg-[#f7f4ed] font-sans text-[#1a1a1b]">
      {/* Navbar con el mismo tono de fondo y borde sutil */}
      <nav className="sticky top-0 z-50 border-b border-[#e6e2d9] bg-[#f7f4ed]/95 backdrop-blur-md p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-[#2563eb] tracking-tighter italic">
            EINSOFT <span className="text-[#1a1a1b] not-italic">NEWS</span>
          </h1>
          <div className="text-[10px] font-bold text-[#65615a] bg-[#e6e2d9] px-2 py-1 rounded-sm uppercase tracking-tighter">
            LIVE FEED
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto mt-8 bg-[#f7f4ed]">
        <div className="px-6 py-4 border-b border-[#e6e2d9] mb-4">
          <h2 className="text-3xl font-serif font-bold tracking-tight">Portada Chilena</h2>
          <p className="text-[#65615a] text-sm italic">Motor de agrupamiento por consenso v1.0</p>
        </div>

        {/* Listado de historias con divisores estilo diario */}
        <div className="flex flex-col">
          {stories.map((story) => (
            <div key={story.id} className="border-b border-[#e6e2d9]">
               <StoryCard story={story} />
            </div>
          ))}
        </div>
      </main>

      <footer className="py-20 text-center text-[10px] text-[#a39e93] uppercase tracking-[0.2em]">
        Einsoft Intelligence Unit • 2026
      </footer>
    </div>
  );
}