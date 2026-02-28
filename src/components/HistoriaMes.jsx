'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const SESGO_COLORS = {
  I:  '#dc2626', CI: '#f97316',
  C:  '#6b7280', CD: '#3b82f6', D: '#1d4ed8',
}
const SESGO_LABEL = {
  I: 'Izquierda', CI: 'C. Izquierda',
  C: 'Centro', CD: 'C. Derecha', D: 'Derecha',
}

function BiasBarMini({ i = 0, ci = 0, c = 0, cd = 0, d = 0 }) {
  const total = i + ci + c + cd + d
  if (total === 0) return null
  const segs = [
    { key: 'I',  val: i,  color: SESGO_COLORS.I  },
    { key: 'CI', val: ci, color: SESGO_COLORS.CI },
    { key: 'C',  val: c,  color: SESGO_COLORS.C  },
    { key: 'CD', val: cd, color: SESGO_COLORS.CD },
    { key: 'D',  val: d,  color: SESGO_COLORS.D  },
  ].filter(s => s.val > 0)

  return (
    <div>
      <div style={{ display: 'flex', height: 8, gap: 1, overflow: 'hidden' }}>
        {segs.map(s => (
          <div
            key={s.key}
            style={{ flex: s.val, background: s.color }}
            title={`${SESGO_LABEL[s.key]}: ${s.val}`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 10, color: '#9ca3af', flexWrap: 'wrap' }}>
        {segs.map(s => (
          <span key={s.key} style={{ color: s.color }}>
            {SESGO_LABEL[s.key]}: {Math.round(s.val / total * 100)}%
          </span>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function HistoriaMes({ slug }) {
  const [historia, setHistoria] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .rpc('get_historia_mes_personaje', { p_slug: slug })

      if (!error && data?.length > 0) setHistoria(data[0])
      setLoading(false)
    }
    cargar()
  }, [slug])

  // ─── Estados vacíos ───────────────────────────────────────
  if (loading) return (
    <div style={{
      border: '2px solid #000', padding: '20px',
      fontFamily: 'Georgia, serif', color: '#9ca3af',
      fontStyle: 'italic', fontSize: 13, textAlign: 'center',
    }}>
      Buscando historia más relevante del mes...
    </div>
  )

  if (!historia) return null

  const fecha = new Date(historia.fecha).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      border: '2px solid #000',
      background: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Franja lateral negra */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: 4, background: '#000',
      }} />

      {/* Header */}
      <div style={{
        padding: '10px 18px 10px 22px',
        borderBottom: '1px solid #000',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
        background: '#000',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16 }}>★</span>
          <div>
            <div style={{
              fontSize: 10, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}>
              Historia del mes
            </div>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>
              La cobertura más relevante donde aparece
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {historia.categoria_ia && (
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff', padding: '2px 10px',
              fontSize: 11, letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {historia.categoria_ia}
            </span>
          )}
          <span style={{
            background: '#fff', color: '#000',
            padding: '2px 10px', fontSize: 12, fontWeight: 'bold',
          }}>
            {historia.menciones_personaje} menciones
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '16px 18px 16px 22px' }}>

        {/* Score + título */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 10 }}>
          {historia.peso_relevancia && (
            <div style={{
              flexShrink: 0, width: 50, height: 50,
              background: '#f9fafb', border: '2px solid #000',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 1 }}>
                {historia.peso_relevancia.toFixed(0)}
              </span>
              <span style={{ fontSize: 9, color: '#9ca3af', letterSpacing: 1 }}>SCORE</span>
            </div>
          )}

          <div style={{ flex: 1 }}>
            <Link
              href={`/historia/${historia.historia_id}`}
              style={{ textDecoration: 'none' }}
            >
              <h3 style={{
                fontSize: 17, fontWeight: 'bold', lineHeight: 1.35,
                color: '#111', margin: 0, cursor: 'pointer',
              }}
                onMouseOver={e => e.currentTarget.style.color = '#1d4ed8'}
                onMouseOut={e  => e.currentTarget.style.color = '#111'}
              >
                {historia.titulo_generado}
              </h3>
            </Link>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
              {fecha} · {historia.total_noticias} artículos · {historia.total_medios} medios
            </div>
          </div>
        </div>

        {/* Resumen */}
        {historia.resumen_ia && (
          <p style={{
            fontSize: 13, color: '#4b5563', lineHeight: 1.6,
            margin: '0 0 14px 0',
            borderLeft: '3px solid #e5e7eb',
            paddingLeft: 10,
          }}>
            {historia.resumen_ia}
          </p>
        )}

        {/* Barra de sesgo */}
        <BiasBarMini
          i={historia.sesgo_izquierda}
          ci={historia.sesgo_centro_izq}
          c={historia.sesgo_centro}
          cd={historia.sesgo_centro_der}
          d={historia.sesgo_derecha}
        />

        {/* CTA */}
        <div style={{ marginTop: 14, textAlign: 'right' }}>
          <Link
            href={`/historia/${historia.historia_id}`}
            style={{
              display: 'inline-block',
              background: '#000', color: '#fff',
              padding: '7px 16px', fontSize: 12,
              textDecoration: 'none', fontWeight: 'bold',
              letterSpacing: 0.5,
            }}
          >
            Ver cobertura completa →
          </Link>
        </div>
      </div>
    </div>
  )
}
