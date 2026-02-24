// components/MediosChart.jsx

const SESGO_COLOR = {
  'izquierda':          '#e74c3c',
  'centro-izquierda':   '#e8a0a0',
  'centro':             '#95a5a6',
  'centro-derecha':     '#7fb3d3',
  'derecha':            '#2c3e50',
};

function colorSesgo(sesgo) {
  if (!sesgo) return '#bbb';
  return SESGO_COLOR[sesgo.toLowerCase()] || '#bbb';
}


export default function MediosChart({ data = [] }) {
  console.log("eentrando a MediosChart con data:", data);
  // Debug: log para ver que llega
  if (typeof window !== 'undefined') {
    console.log('[MediosChart] data recibida:', data);
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '12px', border: '1px dashed #ccc', borderRadius: '3px' }}>
        <p style={{ fontSize: '10px', color: '#aaa', textAlign: 'center', fontFamily: 'Arial Narrow, Arial, sans-serif', letterSpacing: '0.1em' }}>
          COBERTURA POR MEDIO — SIN DATOS
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.total), 1);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.label}>COBERTURA POR MEDIO</span>
        <span style={s.periodo}>7 DIAS</span>
      </div>

      <div style={s.lista}>
        {data.map((medio, i) => {
          const pct   = Math.round((medio.total / max) * 100);
          const color = colorSesgo(medio.sesgo_politico);
          return (
            <div key={medio.id} style={s.fila}>
              <div style={s.nombreRow}>
                <span style={s.rank}>{i + 1}</span>
                <span style={s.nombre} title={medio.nombre}>{medio.nombre}</span>
                <span style={s.total}>{medio.total}</span>
              </div>
              <div style={s.barBg}>
                <div style={{ ...s.bar, width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={s.leyenda}>
        {[
          { label: 'I',  color: '#e74c3c' },
          { label: 'CI', color: '#e8a0a0' },
          { label: 'C',  color: '#95a5a6' },
          { label: 'CD', color: '#7fb3d3' },
          { label: 'D',  color: '#2c3e50' },
        ].map(({ label, color }) => (
          <span key={label} style={s.leyendaItem}>
            <span style={{ ...s.leyendaDot, background: color }} />
            <span style={s.leyendaLabel}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const NARROW = "'Arial Narrow', Arial, sans-serif";
const SERIF  = "'Georgia', 'Times New Roman', serif";
const INK    = '#1a1a1a';
const BORDER = '#d8d4ce';

const s = {
  root:       { width: '100%', fontFamily: SERIF },
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '6px', borderBottom: `2px solid ${INK}` },
  label:      { fontFamily: NARROW, fontSize: '9px', letterSpacing: '0.18em', fontWeight: '700', color: INK },
  periodo:    { fontFamily: NARROW, fontSize: '8px', letterSpacing: '0.12em', color: '#888', borderWidth: '1px', borderStyle: 'solid', borderColor: BORDER, borderRadius: '2px', padding: '1px 5px' },
  lista:      { display: 'flex', flexDirection: 'column', gap: '7px' },
  fila:       { display: 'flex', flexDirection: 'column', gap: '3px' },
  nombreRow:  { display: 'flex', alignItems: 'baseline', gap: '5px' },
  rank:       { fontFamily: NARROW, fontSize: '9px', color: '#bbb', width: '12px', flexShrink: 0, textAlign: 'right' },
  nombre:     { fontFamily: NARROW, fontSize: '11px', color: INK, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.02em' },
  total:      { fontFamily: NARROW, fontSize: '10px', color: '#888', flexShrink: 0 },
  barBg:      { height: '4px', background: '#eee', borderRadius: '2px', overflow: 'hidden', marginLeft: '17px' },
  bar:        { height: '100%', borderRadius: '2px' },
  leyenda:    { display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '8px', borderTop: `1px solid ${BORDER}`, flexWrap: 'wrap' },
  leyendaItem:{ display: 'flex', alignItems: 'center', gap: '3px' },
  leyendaDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  leyendaLabel:{ fontFamily: NARROW, fontSize: '8px', color: '#888', letterSpacing: '0.05em' },
};
