'use client'

// ─── Normalización (mismo criterio que PersonajeCobertura) ────
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

export default function CoberturaMedios({ porMedio = {} }) {
  const medios = Object.entries(porMedio)
    .map(([nombre, stats]) => {
      // Re-normalizar sentimientos sucios
      const normalizado = { total: 0, positivo: 0, neutro: 0, negativo: 0 }
      Object.entries(stats).forEach(([sent, count]) => {
        if (sent === 'total') return
        const s = normalizarSentimiento(sent)
        normalizado[s] += count
        normalizado.total += count
      })
      return { nombre, ...normalizado }
    })
    .filter(m => m.total > 0)
    .sort((a, b) => b.total - a.total)

  if (medios.length === 0) return null

  const maxTotal = medios[0].total

  return (
    <div style={{
      fontFamily: 'Georgia, serif',
      background: '#fff',
      border: '2px solid #000',
    }}>

      {/* Header */}
      <div style={{
        padding: '12px 20px',
        borderBottom: '2px solid #000',
        display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: '#6b7280' }}>
            Distribución editorial
          </div>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>
            Cobertura por Medio
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#6b7280' }}>
          <span style={{ color: COLORS.positivo }}>▲ Positivo</span>
          <span style={{ color: COLORS.neutro   }}>● Neutro</span>
          <span style={{ color: COLORS.negativo }}>▼ Negativo</span>
        </div>
      </div>

      {/* Grid de medios */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 0,
      }}>
        {medios.map((medio, i) => {
          const { nombre, total, positivo, neutro, negativo } = medio
          const pctPos = total > 0 ? (positivo / total) * 100 : 0
          const pctNeu = total > 0 ? (neutro   / total) * 100 : 0
          const pctNeg = total > 0 ? (negativo / total) * 100 : 0
          // Ancho relativo al medio con más menciones
          const anchoBarra = (total / maxTotal) * 100

          // Determinar tono dominante
          let tonoDominante = 'neutro'
          if (positivo > negativo && positivo > neutro) tonoDominante = 'positivo'
          else if (negativo > positivo && negativo > neutro) tonoDominante = 'negativo'

          return (
            <div
              key={nombre}
              style={{
                padding: '14px 20px',
                borderBottom: i < medios.length - 1 ? '1px solid #e5e7eb' : 'none',
                borderRight: (i % 2 === 0 && i < medios.length - 1) ? '1px solid #e5e7eb' : 'none',
              }}
            >
              {/* Nombre + total */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Indicador de tono dominante */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: COLORS[tonoDominante],
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>
                    {nombre}
                  </span>
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 'bold', color: '#111',
                  background: '#f9fafb', padding: '1px 8px',
                  border: '1px solid #e5e7eb',
                }}>
                  {total}
                </span>
              </div>

              {/* Barra de volumen relativo */}
              <div style={{
                height: 22, background: '#f3f4f6',
                marginBottom: 6, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${anchoBarra}%`,
                  display: 'flex',
                }}>
                  {pctPos > 0 && (
                    <div style={{ flex: pctPos, background: COLORS.positivo, opacity: 0.85 }} />
                  )}
                  {pctNeu > 0 && (
                    <div style={{ flex: pctNeu, background: COLORS.neutro, opacity: 0.7 }} />
                  )}
                  {pctNeg > 0 && (
                    <div style={{ flex: pctNeg, background: COLORS.negativo, opacity: 0.85 }} />
                  )}
                </div>
              </div>

              {/* Desglose numérico */}
              <div style={{
                display: 'flex', gap: 12, fontSize: 11,
              }}>
                {positivo > 0 && (
                  <span style={{ color: COLORS.positivo }}>
                    ▲ {positivo} <span style={{ color: '#9ca3af' }}>({Math.round(pctPos)}%)</span>
                  </span>
                )}
                {neutro > 0 && (
                  <span style={{ color: COLORS.neutro }}>
                    ● {neutro} <span style={{ color: '#9ca3af' }}>({Math.round(pctNeu)}%)</span>
                  </span>
                )}
                {negativo > 0 && (
                  <span style={{ color: COLORS.negativo }}>
                    ▼ {negativo} <span style={{ color: '#9ca3af' }}>({Math.round(pctNeg)}%)</span>
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer resumen global */}
      {medios.length > 0 && (() => {
        const totalGlobal   = medios.reduce((s, m) => s + m.total,    0)
        const totalPos      = medios.reduce((s, m) => s + m.positivo, 0)
        const totalNeu      = medios.reduce((s, m) => s + m.neutro,   0)
        const totalNeg      = medios.reduce((s, m) => s + m.negativo, 0)
        return (
          <div style={{
            padding: '10px 20px',
            borderTop: '2px solid #000',
            display: 'flex', gap: 24, alignItems: 'center',
            flexWrap: 'wrap', background: '#fafafa',
          }}>
            <span style={{ fontSize: 11, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase' }}>
              {medios.length} medios · {totalGlobal} menciones totales
            </span>
            <div style={{ display: 'flex', gap: 16, marginLeft: 'auto', fontSize: 12 }}>
              <span style={{ color: COLORS.positivo, fontWeight: 'bold' }}>
                ▲ {totalPos} ({Math.round(totalPos/totalGlobal*100)}%)
              </span>
              <span style={{ color: COLORS.neutro, fontWeight: 'bold' }}>
                ● {totalNeu} ({Math.round(totalNeu/totalGlobal*100)}%)
              </span>
              <span style={{ color: COLORS.negativo, fontWeight: 'bold' }}>
                ▼ {totalNeg} ({Math.round(totalNeg/totalGlobal*100)}%)
              </span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
