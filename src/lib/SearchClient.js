'use client';

// components/SearchClient.js
// Componente cliente del buscador.
// Maneja el estado de la UI y actualiza la URL con los parametros de busqueda.
// NO hace queries a Supabase — eso lo hace el Server Component (app/buscar/page.js).

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SESGO_LABEL = {
  'izquierda':     { label: 'CI', color: '#e74c3c' },
  'centro-izquierda': { label: 'CI', color: '#e74c3c' },
  'centro':        { label: 'C',  color: '#95a5a6' },
  'centro-derecha':{ label: 'CD', color: '#3498db' },
  'derecha':       { label: 'D',  color: '#2c3e50' },
};

export default function SearchClient({
  medios = [],
  resultadosIniciales = [],
  tipoInicial = null,
  queryInicial = '',
  medioIdInicial = null,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [inputVal, setInputVal]   = useState(queryInicial);
  const [medioSel, setMedioSel]   = useState(medioIdInicial || '');

  const ejecutarBusqueda = useCallback((q, medio) => {
    const params = new URLSearchParams();
    if (q)     params.set('q',     q);
    if (medio) params.set('medio', medio);
    startTransition(() => {
      router.push(`/buscar?${params.toString()}`);
    });
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    ejecutarBusqueda(inputVal.trim(), medioSel);
  };

  const handleMedioChange = (e) => {
    const val = e.target.value;
    setMedioSel(val);
    setInputVal('');
    ejecutarBusqueda('', val);
  };

  const limpiar = () => {
    setInputVal('');
    setMedioSel('');
    router.push('/buscar');
  };

  const hayBusqueda = queryInicial || medioIdInicial;
  const nombreMedio = medioIdInicial
    ? medios.find(m => m.id === medioIdInicial)?.nombre
    : null;

  return (
    <div style={s.page}>

      {/* Cabecera editorial */}
      <div style={s.header}>
        <div style={s.headerLine} />
        <h1 style={s.titulo}>ARCHIVO DE HISTORIAS</h1>
        <p style={s.subtitulo}>Busca por ID, titulo, contexto o medio de comunicacion</p>
        <div style={s.headerLine} />
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={s.form}>
        <div style={s.inputRow}>
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            placeholder="Buscar por ID, titulo o termino..."
            style={s.input}
            autoFocus
          />
          <button type="submit" style={s.btnBuscar} disabled={isPending}>
            {isPending ? '...' : 'BUSCAR'}
          </button>
        </div>

        <div style={s.filtroRow}>
          <span style={s.filtroLabel}>FILTRAR POR MEDIO</span>
          <select
            value={medioSel}
            onChange={handleMedioChange}
            style={s.select}
          >
            <option value="">Todos los medios</option>
            {medios.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          {hayBusqueda && (
            <button type="button" onClick={limpiar} style={s.btnLimpiar}>
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* Contexto de busqueda */}
      {hayBusqueda && (
        <div style={s.contexto}>
          {queryInicial && (
            <span>Resultados para <strong>"{queryInicial}"</strong></span>
          )}
          {nombreMedio && (
            <span>Historias cubiertos por <strong>{nombreMedio}</strong></span>
          )}
          <span style={s.conteo}>
            {isPending ? 'Buscando...' : `${resultadosIniciales.length} resultado${resultadosIniciales.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Resultados */}
      <div style={s.resultados}>
        {!hayBusqueda && (
          <div style={s.empty}>
            <span style={s.emptyIcon}>◎</span>
            <p>Ingresa un termino o selecciona un medio para comenzar</p>
          </div>
        )}

        {hayBusqueda && !isPending && resultadosIniciales.length === 0 && (
          <div style={s.empty}>
            <span style={s.emptyIcon}>∅</span>
            <p>No se encontraron historias para esta busqueda</p>
          </div>
        )}

        {resultadosIniciales.map((historia, idx) => (
          <ResultadoCard key={historia.id} historia={historia} idx={idx} />
        ))}
      </div>
    </div>
  );
}

// ─── Tarjeta de resultado ─────────────────────────────────────────────────────

function ResultadoCard({ historia, idx }) {
  return (
    <article style={s.card}>
      <div style={s.cardMeta}>
        <span style={s.cardId}>#{historia.id}</span>
        {historia.categoria_ia && (
          <span style={s.cardCat}>{historia.categoria_ia.toUpperCase()}</span>
        )}
        <span style={s.cardFecha}>
          {new Date(historia.fecha).toLocaleDateString('es-CL', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}
        </span>
        <span style={s.cardNoticias}>
          {historia.total_noticias} nota{historia.total_noticias !== 1 ? 's' : ''}
        </span>
      </div>

      <Link href={`/historia/${historia.id}`} style={{ textDecoration: 'none' }}>
        <h2 style={s.cardTitulo}>{historia.titulo_generado}</h2>
      </Link>

      {historia.resumen_ia && (
        <p style={s.cardResumen}>{historia.resumen_ia}</p>
      )}

      {/* Tags */}
      {historia.tags && historia.tags.length > 0 && (
        <div style={s.tagsRow}>
          {historia.tags.slice(0, 4).map((tag, i) => (
            <span key={i} style={s.tag}>{tag}</span>
          ))}
        </div>
      )}

      {/* Medios que cubrieron */}
      {historia.medios_unicos && historia.medios_unicos.length > 0 && (
        <div style={s.mediosRow}>
          <span style={s.mediosLabel}>CUBIERTO POR</span>
          {historia.medios_unicos.map(m => {
            const sesgo = SESGO_LABEL[m.sesgo_politico?.toLowerCase()] || { label: '?', color: '#aaa' };
            return (
              <span key={m.id} style={s.medioBadge}>
                <span style={{ ...s.sesgoDot, background: sesgo.color }} title={m.sesgo_politico} />
                {m.nombre}
              </span>
            );
          })}
        </div>
      )}

      <div style={s.cardFooter}>
        <span style={s.peso}>Peso: {historia.peso_relevancia?.toFixed(1) || '0.0'}</span>
        <Link href={`/historia/${historia.id}`} style={s.verLink}>
          Ver historia →
        </Link>
      </div>
    </article>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const INK    = '#1a1a1a';
const RED    = '#c0392b';
const CREAM  = '#faf8f4';
const BORDER = '#d8d4ce';
const SERIF  = "'Georgia', 'Times New Roman', serif";
const NARROW = "'Arial Narrow', 'Arial', sans-serif";

const s = {
  page: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '32px 24px 80px',
    fontFamily: SERIF,
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  headerLine: {
    height: '3px',
    background: INK,
    marginBottom: '16px',
  },
  titulo: {
    fontFamily: NARROW,
    fontSize: '13px',
    letterSpacing: '0.25em',
    color: INK,
    margin: '0 0 8px',
    fontWeight: '700',
  },
  subtitulo: {
    fontFamily: SERIF,
    fontSize: '14px',
    color: '#666',
    margin: '0 0 16px',
    fontStyle: 'italic',
  },
  form: {
    marginBottom: '24px',
  },
  inputRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontFamily: SERIF,
    fontSize: '15px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: INK,
    borderRadius: '3px',
    background: 'white',
    outline: 'none',
    color: INK,
  },
  btnBuscar: {
    padding: '12px 24px',
    background: INK,
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    fontFamily: NARROW,
    fontSize: '12px',
    letterSpacing: '0.15em',
    cursor: 'pointer',
    fontWeight: '700',
    flexShrink: 0,
  },
  filtroRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filtroLabel: {
    fontFamily: NARROW,
    fontSize: '9px',
    letterSpacing: '0.18em',
    color: '#888',
    flexShrink: 0,
  },
  select: {
    flex: 1,
    padding: '8px 12px',
    fontFamily: SERIF,
    fontSize: '13px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: BORDER,
    borderRadius: '3px',
    background: 'white',
    color: INK,
    cursor: 'pointer',
    minWidth: '160px',
  },
  btnLimpiar: {
    background: 'none',
    border: 'none',
    color: RED,
    fontFamily: NARROW,
    fontSize: '11px',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    padding: '4px 0',
    flexShrink: 0,
  },
  contexto: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '10px 0',
    borderTop: `1px solid ${BORDER}`,
    borderBottom: `1px solid ${BORDER}`,
    marginBottom: '24px',
    fontFamily: NARROW,
    fontSize: '12px',
    color: '#555',
    flexWrap: 'wrap',
  },
  conteo: {
    marginLeft: 'auto',
    color: '#888',
  },
  resultados: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#aaa',
    fontFamily: SERIF,
    fontStyle: 'italic',
  },
  emptyIcon: {
    display: 'block',
    fontSize: '32px',
    marginBottom: '12px',
  },
  card: {
    background: 'white',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: BORDER,
    padding: '20px 24px',
    marginBottom: '8px',
    borderRadius: '3px',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    flexWrap: 'wrap',
  },
  cardId: {
    fontFamily: 'monospace',
    fontSize: '11px',
    background: INK,
    color: 'white',
    padding: '2px 6px',
    borderRadius: '2px',
    flexShrink: 0,
  },
  cardCat: {
    fontFamily: NARROW,
    fontSize: '9px',
    letterSpacing: '0.15em',
    color: '#888',
    textTransform: 'uppercase',
  },
  cardFecha: {
    fontFamily: NARROW,
    fontSize: '10px',
    color: '#aaa',
    marginLeft: 'auto',
  },
  cardNoticias: {
    fontFamily: NARROW,
    fontSize: '10px',
    color: '#aaa',
  },
  cardTitulo: {
    fontFamily: SERIF,
    fontSize: '20px',
    fontWeight: '700',
    color: INK,
    lineHeight: 1.3,
    margin: '0 0 10px',
    cursor: 'pointer',
  },
  cardResumen: {
    fontFamily: SERIF,
    fontSize: '13px',
    color: '#555',
    lineHeight: 1.6,
    margin: '0 0 12px',
  },
  tagsRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  tag: {
    fontFamily: NARROW,
    fontSize: '9px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    background: CREAM,
    color: '#666',
    padding: '3px 8px',
    borderRadius: '2px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: BORDER,
  },
  mediosRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '12px',
  },
  mediosLabel: {
    fontFamily: NARROW,
    fontSize: '8px',
    letterSpacing: '0.15em',
    color: '#aaa',
    flexShrink: 0,
  },
  medioBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: NARROW,
    fontSize: '11px',
    color: '#555',
  },
  sesgoDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid #eee`,
  },
  peso: {
    fontFamily: NARROW,
    fontSize: '10px',
    color: '#aaa',
  },
  verLink: {
    fontFamily: NARROW,
    fontSize: '11px',
    letterSpacing: '0.08em',
    color: RED,
    textDecoration: 'none',
  },
};
