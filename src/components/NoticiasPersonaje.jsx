'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Configuración del espectro político
const ESPECTRO = [
  { valor: 'izquierda',      label: 'I',       color: '#c0392b', bg: '#fdf0ee', dot: '#e74c3c' },
  { valor: 'centro_izquierda', label: 'C.I',   color: '#e67e22', bg: '#fef6ee', dot: '#f39c12' },
  { valor: 'centro',         label: 'C',           color: '#7f8c8d', bg: '#f4f4f4', dot: '#95a5a6' },
  { valor: 'centro_derecha', label: 'C.D.',      color: '#2980b9', bg: '#eef4fb', dot: '#3498db' },
  { valor: 'derecha',        label: 'D',          color: '#1a3a6b', bg: '#eef0f8', dot: '#1a3a6b' },
  { valor: null,             label: 'Sin clasificar',   color: '#bdc3c7', bg: '#f9f9f9', dot: '#bdc3c7' },
];

const SENTIMIENTO_CONFIG = {
  positivo: { label: 'Positivo', color: '#27ae60', icon: '↑', bg: '#eafaf1' },
  negativo: { label: 'Negativo', color: '#e74c3c', icon: '↓', bg: '#fdf0ef' },
  neutro:   { label: 'Neutro',   color: '#7f8c8d', icon: '→', bg: '#f4f4f4' },
};

function getEspectro(sesgo) {
  return ESPECTRO.find(e => e.valor === sesgo) || ESPECTRO[ESPECTRO.length - 1];
}

function formatFecha(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NoticiasPersonaje({ noticias = [] }) {
  const [filtroEspectro, setFiltroEspectro] = useState(new Set()); // vacío = todos
  const [orden, setOrden] = useState('fecha'); // 'fecha' | 'relevancia'

  const noticiasReales = useMemo(() =>
    noticias.filter(n => n.noticia_id !== null),
    [noticias]
  );

  const noticiasFiltradas = useMemo(() => {
    let result = [...noticiasReales];

    // Filtro de espectro
    if (filtroEspectro.size > 0) {
      result = result.filter(n => filtroEspectro.has(n.medio_sesgo ?? null));
    }

    // Orden
    if (orden === 'fecha') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else {
      result.sort((a, b) => (b.peso_relevancia ?? 0) - (a.peso_relevancia ?? 0));
    }

    return result;
  }, [noticiasReales, filtroEspectro, orden]);

  // Conteos por espectro para los badges
  const conteosPorEspectro = useMemo(() => {
    const map = {};
    for (const n of noticiasReales) {
      const k = n.medio_sesgo ?? 'null';
      map[k] = (map[k] || 0) + 1;
    }
    return map;
  }, [noticiasReales]);

  function toggleEspectro(valor) {
    setFiltroEspectro(prev => {
      const next = new Set(prev);
      if (next.has(valor)) next.delete(valor);
      else next.add(valor);
      return next;
    });
  }

  return (
    <section style={{ fontFamily: "'Georgia', serif" }}>

      {/* ── Barra de espectro ── */}
      <div style={{
        background: '#fff',
        border: '2px solid #1a1a1a',
        borderRadius: 0,
        padding: '20px 24px',
        marginBottom: 24,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <h3 style={{
            margin: 0,
            fontSize: 11,
            fontFamily: "'Georgia', serif",
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}>
            Filtrar por espectro político
          </h3>
          {filtroEspectro.size > 0 && (
            <button
              onClick={() => setFiltroEspectro(new Set())}
              style={{
                background: 'none',
                border: '1px solid #ccc',
                borderRadius: 0,
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                color: '#666',
                fontFamily: 'inherit',
                letterSpacing: '0.05em',
              }}
            >
              Limpiar filtro
            </button>
          )}
        </div>

        {/* Escala visual */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderRadius: 0,
          overflow: 'hidden',
          border: '1.5px solid #1a1a1a',
          marginBottom: 10,
        }}>
          {ESPECTRO.filter(e => e.valor !== null).map((esp, i) => {
            const activo = filtroEspectro.has(esp.valor);
            const count = conteosPorEspectro[esp.valor] || 0;
            return (
              <button
                key={esp.valor}
                onClick={() => toggleEspectro(esp.valor)}
                title={`${esp.label} (${count} noticias)`}
                style={{
                  flex: 1,
                  background: activo ? esp.color : esp.bg,
                  border: 'none',
                  borderRight: i < 4 ? '1px solid rgba(0,0,0,0.15)' : 'none',
                  padding: '10px 6px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <div style={{
                  fontSize: 10,
                  fontFamily: "'Georgia', serif",
                  fontWeight: activo ? 700 : 500,
                  color: activo ? '#fff' : esp.color,
                  letterSpacing: '0.04em',
                  lineHeight: 1.3,
                  textTransform: 'uppercase',
                }}>
                  {esp.label}
                </div>
                {count > 0 && (
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: activo ? 'rgba(255,255,255,0.9)' : esp.color,
                    marginTop: 2,
                  }}>
                    {count}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Gradiente decorativo */}
        <div style={{
          height: 4,
          background: 'linear-gradient(to right, #c0392b, #e67e22, #7f8c8d, #2980b9, #1a3a6b)',
          borderRadius: 2,
          opacity: 0.6,
        }} />
      </div>

      {/* ── Controles de orden + contador ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <p style={{
          margin: 0,
          fontSize: 12,
          color: '#666',
          fontFamily: "'Georgia', serif",
        }}>
          <strong style={{ color: '#1a1a1a' }}>{noticiasFiltradas.length}</strong>
          {' '}noticia{noticiasFiltradas.length !== 1 ? 's' : ''}
          {filtroEspectro.size > 0 && ' (filtradas)'}
        </p>

        <div style={{ display: 'flex', gap: 0, border: '1.5px solid #1a1a1a' }}>
          {[
            { val: 'fecha', label: 'Más recientes' },
            { val: 'relevancia', label: 'Más relevantes' },
          ].map((op, i) => (
            <button
              key={op.val}
              onClick={() => setOrden(op.val)}
              style={{
                background: orden === op.val ? '#1a1a1a' : '#fff',
                color: orden === op.val ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRight: i === 0 ? '1px solid #1a1a1a' : 'none',
                padding: '6px 14px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: "'Georgia', serif",
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                transition: 'all 0.12s',
              }}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista de noticias ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {noticiasFiltradas.length === 0 ? (
          <div style={{
            padding: '40px 24px',
            textAlign: 'center',
            border: '2px dashed #ddd',
            color: '#999',
            fontSize: 14,
            fontFamily: "'Georgia', serif",
          }}>
            No hay noticias para los filtros seleccionados.
          </div>
        ) : (
          noticiasFiltradas.map((noticia) => {
            const esp = getEspectro(noticia.medio_sesgo);
            const sent = SENTIMIENTO_CONFIG[noticia.sentimiento] || SENTIMIENTO_CONFIG.neutro;

            return (
              <article
                key={noticia.noticia_id}
                style={{
                  background: '#fff',
                  border: '2px solid #1a1a1a',
                  borderLeft: `5px solid ${esp.color}`,
                  padding: '16px 20px',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(2px)';
                  e.currentTarget.style.boxShadow = '3px 3px 0 #1a1a1a';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Fila superior: medio + espectro + sentimiento + fecha */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  flexWrap: 'wrap',
                }}>
                  {/* Badge espectro */}
                  <span style={{
                    fontSize: 9,
                    fontFamily: "'Georgia', serif",
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: esp.color,
                    background: esp.bg,
                    border: `1px solid ${esp.color}`,
                    padding: '2px 7px',
                    borderRadius: 0,
                  }}>
                    {esp.label}
                  </span>

                  {/* Nombre medio */}
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#1a1a1a',
                    fontFamily: "'Georgia', serif",
                  }}>
                    {noticia.medio_nombre}
                  </span>

                  <span style={{ color: '#ccc', fontSize: 10 }}>·</span>

                  {/* Fecha */}
                  <span style={{
                    fontSize: 11,
                    color: '#888',
                    fontFamily: "'Georgia', serif",
                  }}>
                    {formatFecha(noticia.created_at)}
                  </span>

                  {/* Sentimiento */}
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 10,
                    fontWeight: 700,
                    color: sent.color,
                    background: sent.bg,
                    padding: '2px 8px',
                    border: `1px solid ${sent.color}`,
                    borderRadius: 0,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontFamily: "'Georgia', serif",
                  }}>
                    {sent.icon} {sent.label}
                  </span>
                </div>

                {/* Historia vinculada */}
                {noticia.historia_id && (
                  <div style={{ marginBottom: 6 }}>
                    <Link
                      href={`/historia/${noticia.historia_id}`}
                      style={{
                        fontSize: 10,
                        color: '#888',
                        textDecoration: 'none',
                        letterSpacing: '0.05em',
                        fontFamily: "'Georgia', serif",
                        borderBottom: '1px dotted #ccc',
                      }}
                    >
                      Historia #{noticia.historia_id}: {noticia.historia_titulo}
                    </Link>
                  </div>
                )}

                {/* Título */}
                <h3 style={{
                  margin: '0 0 8px',
                  fontSize: 15,
                  lineHeight: 1.45,
                  fontWeight: 700,
                  color: '#1a1a1a',
                  fontFamily: "'Georgia', serif",
                }}>
                  {noticia.titulo}
                </h3>

                {/* Resumen si existe */}
                {noticia.resumen && (
                  <p style={{
                    margin: '0 0 10px',
                    fontSize: 13,
                    color: '#555',
                    lineHeight: 1.6,
                    fontFamily: "'Georgia', serif",
                    borderLeft: '2px solid #eee',
                    paddingLeft: 10,
                  }}>
                    {noticia.resumen.length > 200
                      ? noticia.resumen.slice(0, 200) + '…'
                      : noticia.resumen}
                  </p>
                )}

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <a
                    href={noticia.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: esp.color,
                      textDecoration: 'none',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      fontFamily: "'Georgia', serif",
                      borderBottom: `1px solid ${esp.color}`,
                      paddingBottom: 1,
                    }}
                  >
                    Leer noticia →
                  </a>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
