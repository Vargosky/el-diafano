'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

// ─── Helpers ──────────────────────────────────────────────────
const SENTIMIENTO_COLOR = {
  positivo: { bg: '#dcfce7', text: '#166534', label: '▲ Positivo' },
  negativo: { bg: '#fee2e2', text: '#991b1b', label: '▼ Negativo' },
  neutro:   { bg: '#f3f4f6', text: '#374151', label: '● Neutro'  },
}

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// ─── Componente tarjeta de candidato ──────────────────────────
function TarjetaCandidato({ personaje, onAprobar, onRechazar }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nombre:  personaje.nombre  || '',
    cargo:   personaje.cargo   || '',
    partido: personaje.partido || '',
    bio:     '',
    foto:    '',
  })
  const [loading, setLoading] = useState(false)

  const sent = SENTIMIENTO_COLOR[personaje.sentimiento_promedio] || SENTIMIENTO_COLOR.neutro

  async function handleAprobar() {
    setLoading(true)
    await onAprobar(personaje.id, form)
    setLoading(false)
  }

  async function handleRechazar() {
    setLoading(true)
    await onRechazar(personaje.id)
    setLoading(false)
  }

  return (
    <div style={{
      border: '2px solid #000',
      background: '#fff',
      marginBottom: 16,
      fontFamily: 'Georgia, serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Avatar placeholder */}
          <div style={{
            width: 44, height: 44,
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{personaje.nombre}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {personaje.cargo || 'Cargo no detectado'}
              {personaje.partido && ` · ${personaje.partido}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Menciones */}
          <span style={{
            background: '#000', color: '#fff',
            padding: '3px 10px', fontSize: 13, fontWeight: 'bold',
          }}>
            {personaje.menciones} menciones
          </span>

          {/* Sentimiento */}
          <span style={{
            background: sent.bg, color: sent.text,
            padding: '3px 10px', fontSize: 12,
          }}>
            {sent.label}
          </span>

          {/* Fechas */}
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            {formatFecha(personaje.primera_mencion)} → {formatFecha(personaje.ultima_mencion)}
          </span>
        </div>
      </div>

      {/* Formulario de edición */}
      {editando && (
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fafafa',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          {[
            { key: 'nombre',  label: 'Nombre completo' },
            { key: 'cargo',   label: 'Cargo / rol'     },
            { key: 'partido', label: 'Partido / coalición' },
            { key: 'foto',    label: 'URL foto (Wikipedia, etc.)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 3 }}>
                {label}
              </label>
              <input
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                style={{
                  width: '100%', padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  fontFamily: 'Georgia, serif', fontSize: 13,
                }}
              />
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 11, fontWeight: 'bold', display: 'block', marginBottom: 3 }}>
              Biografía breve
            </label>
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={2}
              style={{
                width: '100%', padding: '6px 8px',
                border: '1px solid #d1d5db',
                fontFamily: 'Georgia, serif', fontSize: 13,
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        gap: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
        <button
          onClick={() => setEditando(e => !e)}
          style={{
            background: '#fff', border: '1px solid #d1d5db',
            padding: '6px 14px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: 13,
          }}
        >
          {editando ? 'Cancelar edición' : '✏️ Editar datos'}
        </button>

        <button
          onClick={handleRechazar}
          disabled={loading}
          style={{
            background: '#fff', border: '2px solid #dc2626', color: '#dc2626',
            padding: '6px 14px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 'bold',
          }}
        >
          ✕ Rechazar
        </button>

        <button
          onClick={handleAprobar}
          disabled={loading}
          style={{
            background: '#000', color: '#fff', border: 'none',
            padding: '6px 18px', cursor: 'pointer',
            fontFamily: 'Georgia, serif', fontSize: 13, fontWeight: 'bold',
          }}
        >
          {loading ? 'Guardando...' : '✓ Aprobar'}
        </button>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ──────────────────────────────────────────
export default function PersonajesPendientes() {
  const [candidatos, setCandidatos] = useState([])
  const [loading, setLoading]       = useState(true)
  const [syncing, setSyncing]       = useState(false)
  const [mensaje, setMensaje]       = useState(null)
  const [filtroMin, setFiltroMin]   = useState(3)

  const supabase = createClient()

  async function cargarCandidatos() {
    setLoading(true)
    const { data, error } = await supabase
      .from('personajes')
      .select('id, nombre, slug, cargo, partido, menciones, sentimiento_promedio, primera_mencion, ultima_mencion')
      .eq('pendiente', true)
      .eq('activo', false)
      .gte('menciones', filtroMin)
      .order('menciones', { ascending: false })

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error cargando candidatos: ' + error.message })
    } else {
      setCandidatos(data || [])
    }
    setLoading(false)
  }

  async function correrSync() {
    setSyncing(true)
    setMensaje(null)
    const { data, error } = await supabase.rpc('sync_personajes_candidatos')
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error en sync: ' + error.message })
    } else {
      const nuevos      = data?.filter(r => r.accion === 'NUEVO').length || 0
      const actualizados = data?.filter(r => r.accion === 'ACTUALIZADO').length || 0
      setMensaje({
        tipo: 'ok',
        texto: `Sync completo — ${nuevos} nuevos candidatos, ${actualizados} actualizados`
      })
      await cargarCandidatos()
    }
    setSyncing(false)
  }

  async function aprobar(id, form) {
    const { error } = await supabase.rpc('aprobar_personaje', {
      p_id:      id,
      p_nombre:  form.nombre  || null,
      p_cargo:   form.cargo   || null,
      p_partido: form.partido || null,
      p_bio:     form.bio     || null,
      p_foto:    form.foto    || null,
    })
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error aprobando: ' + error.message })
    } else {
      setCandidatos(c => c.filter(p => p.id !== id))
      setMensaje({ tipo: 'ok', texto: 'Personaje aprobado y publicado ✓' })
    }
  }

  async function rechazar(id) {
    const { error } = await supabase.rpc('rechazar_personaje', { p_id: id })
    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error rechazando: ' + error.message })
    } else {
      setCandidatos(c => c.filter(p => p.id !== id))
    }
  }

  useEffect(() => { cargarCandidatos() }, [filtroMin])

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: 860,
      margin: '0 auto',
      padding: '32px 16px',
      fontFamily: 'Georgia, serif',
    }}>

      {/* Header */}
      <div style={{ borderBottom: '3px solid #000', marginBottom: 24, paddingBottom: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#6b7280', marginBottom: 4 }}>
          El Diáfano · Panel de administración
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>
          Personajes pendientes de aprobación
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
          Detectados automáticamente desde <code>entidades_temp</code>. Revisa, completa datos y aprueba.
        </p>
      </div>

      {/* Controles */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center',
        marginBottom: 20, flexWrap: 'wrap',
      }}>

        <button
          onClick={correrSync}
          disabled={syncing}
          style={{
            background: syncing ? '#6b7280' : '#000',
            color: '#fff', border: 'none',
            padding: '10px 20px', cursor: syncing ? 'not-allowed' : 'pointer',
            fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: 'bold',
          }}
        >
          {syncing ? '⏳ Analizando noticias...' : '⚡ Correr análisis de menciones'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <label style={{ color: '#374151' }}>Menciones mínimas:</label>
          {[3, 5, 10, 20].map(n => (
            <button
              key={n}
              onClick={() => setFiltroMin(n)}
              style={{
                padding: '4px 12px',
                background: filtroMin === n ? '#000' : '#fff',
                color:      filtroMin === n ? '#fff' : '#000',
                border: '1px solid #000',
                cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: 13,
              }}
            >
              {n}+
            </button>
          ))}
        </div>

        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#6b7280' }}>
          {candidatos.length} candidatos
        </span>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div style={{
          padding: '10px 16px',
          marginBottom: 16,
          background: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${mensaje.tipo === 'ok' ? '#16a34a' : '#dc2626'}`,
          color:  mensaje.tipo === 'ok' ? '#166534' : '#991b1b',
          fontSize: 13,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontStyle: 'italic' }}>
          Cargando candidatos...
        </div>
      ) : candidatos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 48,
          border: '2px dashed #d1d5db', color: '#9ca3af',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <div style={{ fontStyle: 'italic' }}>
            No hay candidatos pendientes con {filtroMin}+ menciones.
            <br />Corre el análisis para detectar nuevos personajes.
          </div>
        </div>
      ) : (
        candidatos.map(p => (
          <TarjetaCandidato
            key={p.id}
            personaje={p}
            onAprobar={aprobar}
            onRechazar={rechazar}
          />
        ))
      )}
    </div>
  )
}