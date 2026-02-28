'use client'

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

// ─── Normalización de sentimientos sucios de la IA ────────────
function normalizarSentimiento(s) {
  if (!s || s.trim() === '') return 'neutro'
  const v = s.trim().toLowerCase()
  if (['positivo', 'pos', 'positive', 'bueno'].includes(v)) return 'positivo'
  if (['negativo', 'neg', 'negative', 'malo'].includes(v))  return 'negativo'
  return 'neutro'
}

const COLORS = {
  positivo: '#16a34a',
  neutro:   '#94a3b8',
  negativo: '#dc2626',
}

const RANGOS = [
  { label: '7D',  dias: 7   },
  { label: '14D', dias: 14  },
  { label: '30D', dias: 30  },
  { label: 'MAX', dias: 999 },
]

// ─── Nota de reputación ───────────────────────────────────────
function calcularNota(datos) {
  if (!datos.length) return null
  const recientes = datos.slice(-7)
  let pos = 0, neg = 0, neu = 0
  recientes.forEach(d => { pos += d.positivo; neg += d.negativo; neu += d.neutro })
  const total = pos + neg + neu
  if (total === 0) return null
  const score = (pos * 1 + neu * 0.5 - neg * 0.8) / total
  return Math.min(10, Math.max(0, ((score + 0.8) / 1.8) * 10)).toFixed(1)
}

function labelNota(nota) {
  if (nota === null) return { texto: 'Sin datos suficientes', color: '#94a3b8', bg: '#f8fafc' }
  const n = parseFloat(nota)
  if (n >= 7.5) return { texto: 'Cobertura muy favorable',  color: '#15803d', bg: '#dcfce7' }
  if (n >= 6.0) return { texto: 'Cobertura favorable',      color: '#16a34a', bg: '#f0fdf4' }
  if (n >= 4.5) return { texto: 'Cobertura mixta',          color: '#b45309', bg: '#fef9c3' }
  if (n >= 3.0) return { texto: 'Bajo presión mediática',   color: '#dc2626', bg: '#fee2e2' }
  return         { texto: 'Cobertura muy negativa',         color: '#991b1b', bg: '#fef2f2' }
}

// ─── Tooltip ──────────────────────────────────────────────────
function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const get = key => payload.find(p => p.dataKey === key)?.value || 0
  const total = get('positivo') + get('neutro') + get('negativo')
  return (
    <div style={{
      background: '#fff', border: '2px solid #000',
      padding: '10px 14px', fontFamily: 'Georgia, serif', fontSize: 12, minWidth: 150,
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: 6, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 }}>
        {label}
      </div>
      {[
        { key: 'positivo', label: '▲ Positivos', color: COLORS.positivo },
        { key: 'neutro',   label: '● Neutros',   color: COLORS.neutro   },
        { key: 'negativo', label: '▼ Negativos', color: COLORS.negativo },
      ].map(({ key, label: l, color }) => (
        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color }}>
          <span>{l}</span><span style={{ fontWeight: 'bold' }}>{get(key)}</span>
        </div>
      ))}
      <div style={{
        borderTop: '1px solid #e5e7eb', marginTop: 6, paddingTop: 4,
        display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#111',
      }}>
        <span>Total</span><span>{total}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// Recibe `noticias` directamente desde page.js — sin fetch propio
// ═══════════════════════════════════════════════════════════════
export default function PersonajeCobertura({ noticias = [] }) {
  const [rangoIdx, setRangoIdx] = useState(1) // 14D por defecto

  // ─── Procesar noticias → datos por día ────────────────────
  const todosLosDatos = useMemo(() => {
    const mapa = {}

    noticias.forEach(n => {
      if (!n.noticia_id) return
      // Usar created_at o fecha de la noticia
      const fecha = n.noticia_fecha || n.fecha || n.created_at
      if (!fecha) return

      const dia = typeof fecha === 'string'
        ? fecha.slice(0, 10)
        : new Date(fecha).toISOString().slice(0, 10)

      const s = normalizarSentimiento(n.sentimiento)

      if (!mapa[dia]) mapa[dia] = { dia, positivo: 0, neutro: 0, negativo: 0 }
      mapa[dia][s]++
    })

    return Object.values(mapa)
      .sort((a, b) => a.dia.localeCompare(b.dia))
      .map(d => ({
        ...d,
        label: new Date(d.dia + 'T12:00:00').toLocaleDateString('es-CL', {
          day: 'numeric', month: 'short',
        }),
        total: d.positivo + d.neutro + d.negativo,
      }))
  }, [noticias])

  // ─── Aplicar rango ────────────────────────────────────────
  const datos = useMemo(() => {
    const dias = RANGOS[rangoIdx].dias
    return dias >= 999 ? todosLosDatos : todosLosDatos.slice(-dias)
  }, [todosLosDatos, rangoIdx])

  const nota     = calcularNota(datos)
  const notaInfo = labelNota(nota)

  const totales = datos.reduce(
    (acc, d) => ({ positivo: acc.positivo + d.positivo, neutro: acc.neutro + d.neutro, negativo: acc.negativo + d.negativo }),
    { positivo: 0, neutro: 0, negativo: 0 }
  )
  const totalGeneral = totales.positivo + totales.neutro + totales.negativo

  // ─── RENDER ───────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#fff', border: '2px solid #000' }}>

      {/* Header */}
      <div style={{
        padding: '12px 18px', borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: '#6b7280' }}>
            Análisis de cobertura
          </div>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>Apariciones en prensa</div>
        </div>
        {/* Selector de rango */}
        <div style={{ display: 'flex' }}>
          {RANGOS.map((r, i) => (
            <button key={r.label} onClick={() => setRangoIdx(i)} style={{
              padding: '4px 12px',
              background: rangoIdx === i ? '#000' : '#fff',
              color:      rangoIdx === i ? '#fff' : '#000',
              border: '1px solid #000',
              borderLeft: i > 0 ? 'none' : '1px solid #000',
              cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: 12,
              fontWeight: rangoIdx === i ? 'bold' : 'normal',
            }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nota de reputación */}
      <div style={{
        padding: '12px 18px', borderBottom: '1px solid #e5e7eb',
        background: notaInfo.bg, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
      }}>
        {nota !== null && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
            <span style={{ fontSize: 34, fontWeight: 'bold', color: notaInfo.color, lineHeight: 1 }}>{nota}</span>
            <span style={{ fontSize: 13, color: notaInfo.color }}>/10</span>
          </div>
        )}
        <div>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: notaInfo.color }}>{notaInfo.texto}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            Últimos 7 días · {totalGeneral} menciones en el período seleccionado
          </div>
        </div>
        {/* Barra de proporción */}
        {totalGeneral > 0 && (
          <div style={{ flex: 1, minWidth: 100 }}>
            <div style={{ display: 'flex', height: 7, overflow: 'hidden', gap: 1 }}>
              {totales.positivo > 0 && <div style={{ flex: totales.positivo, background: COLORS.positivo }} />}
              {totales.neutro   > 0 && <div style={{ flex: totales.neutro,   background: COLORS.neutro   }} />}
              {totales.negativo > 0 && <div style={{ flex: totales.negativo, background: COLORS.negativo }} />}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 3, fontSize: 10, color: '#6b7280' }}>
              <span style={{ color: COLORS.positivo }}>▲ {Math.round(totales.positivo/totalGeneral*100)}%</span>
              <span style={{ color: COLORS.neutro   }}>● {Math.round(totales.neutro/totalGeneral*100)}%</span>
              <span style={{ color: COLORS.negativo }}>▼ {Math.round(totales.negativo/totalGeneral*100)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div style={{ padding: '14px 6px 6px 2px' }}>
        {datos.length === 0 ? (
          <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontStyle: 'italic', fontSize: 13 }}>
            Sin datos para este período
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={datos} margin={{ top: 4, right: 14, left: -22, bottom: 0 }}>
              <defs>
                {[
                  { id: 'gradPos', color: COLORS.positivo },
                  { id: 'gradNeu', color: COLORS.neutro   },
                  { id: 'gradNeg', color: COLORS.negativo },
                ].map(({ id, color }) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.04} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fontFamily: 'Georgia, serif', fill: '#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fontFamily: 'Georgia, serif', fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<TooltipCustom />} />
              <Area type="monotone" dataKey="positivo" stackId="1" stroke={COLORS.positivo} strokeWidth={1.5} fill="url(#gradPos)" />
              <Area type="monotone" dataKey="neutro"   stackId="1" stroke={COLORS.neutro}   strokeWidth={1}   fill="url(#gradNeu)" />
              <Area type="monotone" dataKey="negativo" stackId="1" stroke={COLORS.negativo} strokeWidth={1.5} fill="url(#gradNeg)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer totales */}
      {totalGeneral > 0 && (
        <div style={{
          padding: '10px 18px', borderTop: '1px solid #e5e7eb',
          display: 'flex', gap: 20, justifyContent: 'center', fontSize: 12,
        }}>
          {[
            { label: '▲ Positivos', val: totales.positivo, color: COLORS.positivo },
            { label: '● Neutros',   val: totales.neutro,   color: COLORS.neutro   },
            { label: '▼ Negativos', val: totales.negativo, color: COLORS.negativo },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 'bold', fontSize: 17, color }}>{val}</div>
              <div style={{ color: '#9ca3af', fontSize: 11 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}