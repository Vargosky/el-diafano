'use client';

// DateNavigator -- El Diafano
// Componente de navegacion temporal para el sidebar.
// Props:
//   onDateChange?  (dateStr: string) => void
//   minDate?       string YYYY-MM-DD  (default: '2024-01-01')
//   activeDates?   string[]           (fechas con datos, puntito rojo)

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const DIAS  = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DIAS_MIN = ['D','L','M','M','J','V','S'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromStr(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function todayLocal() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSame(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export default function DateNavigator({
  onDateChange,
  minDate = '2024-01-01',
  activeDates = [],
}) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const todayObj  = todayLocal();
  const minObj    = fromStr(minDate);
  const activeSet = new Set(activeDates);

  const [selected, setSelected] = useState(() => {
    const param = searchParams?.get('fecha');
    if (param && /^\d{4}-\d{2}-\d{2}$/.test(param)) {
      const d = fromStr(param);
      if (d >= minObj && d <= todayObj) return d;
    }
    return todayObj;
  });

  const [calOpen, setCalOpen] = useState(false);
  const [calView, setCalView] = useState({
    year:  selected.getFullYear(),
    month: selected.getMonth(),
  });

  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!calOpen) return;
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setCalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calOpen]);

  const applyDate = useCallback((newDate) => {
    setSelected(newDate);
    setCalOpen(false);
    const str = toStr(newDate);
    onDateChange?.(str);
    if (router && searchParams !== null) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('fecha', str);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, onDateChange]);

  const canPrev = selected > minObj;
  const canNext = !isSame(selected, todayObj);

  const daysInMonth = new Date(calView.year, calView.month + 1, 0).getDate();
  const firstDow    = new Date(calView.year, calView.month, 1).getDay();
  const cells       = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = isSame(selected, todayObj);

  return (
    <div style={s.root} ref={wrapperRef}>
      <span style={s.label}>EDICION</span>

      <div style={s.navRow}>
        <button
          style={{ ...s.arrow, ...(!canPrev ? s.arrowOff : {}) }}
          onClick={() => canPrev && applyDate(addDays(selected, -1))}
          disabled={!canPrev}
          aria-label="Dia anterior"
        >
          &#8249;
        </button>

        <button style={s.pill} onClick={() => {
          setCalView({ year: selected.getFullYear(), month: selected.getMonth() });
          setCalOpen(v => !v);
        }}>
          <span style={s.pillDow}>{DIAS[selected.getDay()]}</span>
          <span style={s.pillDate}>
            {selected.getDate()} {MESES[selected.getMonth()].slice(0,3).toUpperCase()} {selected.getFullYear()}
          </span>
          {isToday && <span style={s.redDot} title="Hoy" />}
          <span style={s.caret}>{calOpen ? '\u25b2' : '\u25bc'}</span>
        </button>

        <button
          style={{ ...s.arrow, ...(!canNext ? s.arrowOff : {}) }}
          onClick={() => canNext && applyDate(addDays(selected, 1))}
          disabled={!canNext}
          aria-label="Dia siguiente"
        >
          &#8250;
        </button>
      </div>

      {calOpen && (
        <div style={s.cal}>
          <div style={s.calHead}>
            <button style={s.calNavBtn} onClick={() => setCalView(v => {
              const m = v.month === 0 ? 11 : v.month - 1;
              const y = v.month === 0 ? v.year - 1 : v.year;
              return { year: y, month: m };
            })}>&#8249;</button>
            <span style={s.calTitle}>
              {MESES[calView.month].toUpperCase()} {calView.year}
            </span>
            <button style={s.calNavBtn} onClick={() => setCalView(v => {
              const m = v.month === 11 ? 0 : v.month + 1;
              const y = v.month === 11 ? v.year + 1 : v.year;
              return { year: y, month: m };
            })}>&#8250;</button>
          </div>

          <div style={s.calDowRow}>
            {DIAS_MIN.map((d, i) => <div key={i} style={s.calDow}>{d}</div>)}
          </div>

          <div style={s.calGrid}>
            {cells.map((day, i) => {
              if (!day) return <div key={`_${i}`} />;
              const cellDate = new Date(calView.year, calView.month, day);
              const isSel    = isSame(cellDate, selected);
              const isTod    = isSame(cellDate, todayObj);
              const disabled = cellDate > todayObj || cellDate < minObj;
              const hasData  = activeSet.has(toStr(cellDate));

              let extra = {};
              if (disabled)   extra = s.cellOff;
              else if (isSel) extra = s.cellSel;
              else if (isTod) extra = s.cellToday;

              return (
                <div
                  key={day}
                  style={{ ...s.cell, ...extra }}
                  onClick={() => !disabled && applyDate(cellDate)}
                >
                  {day}
                  {hasData && !isSel && <span style={s.dataDot} />}
                </div>
              );
            })}
          </div>

          <div style={s.quickRow}>
            {[
              { label: 'Hoy',      date: todayObj },
              { label: 'Ayer',     date: addDays(todayObj, -1) },
              { label: 'Hace 7d',  date: addDays(todayObj, -7) },
              { label: 'Hace 30d', date: addDays(todayObj, -30) },
            ].map(({ label, date }) => (
              <button key={label} style={s.quickBtn} onClick={() => applyDate(date)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isToday && (
        <div style={s.archiveBadge}>
          <span>&#9716;</span>
          <span style={{ flex: 1 }}>Edicion del archivo</span>
          <button style={s.backBtn} onClick={() => applyDate(todayObj)}>
            &larr; Hoy
          </button>
        </div>
      )}
    </div>
  );
}

const INK    = '#1a1a1a';
const RED    = '#c0392b';
const BORDER = '#d8d4ce';
const MUTED  = '#888';
const SERIF  = "'Georgia', 'Times New Roman', serif";
const NARROW = "'Arial Narrow', 'Arial', sans-serif";

const s = {
  root:    { width: '100%', fontFamily: SERIF, position: 'relative' },
  label:   { display: 'block', fontSize: '9px', fontFamily: NARROW, letterSpacing: '0.18em', color: MUTED, marginBottom: '6px' },
  navRow:  { display: 'flex', alignItems: 'stretch', gap: '3px', position: 'relative' },
  arrow:   { width: '26px', flexShrink: 0, background: 'white', borderWidth: '1px', borderStyle: 'solid', borderColor: BORDER, borderRadius: '3px', cursor: 'pointer', color: INK, fontSize: '20px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 0 2px' },
  arrowOff:{ color: '#ccc', cursor: 'default', borderColor: '#eee' },
  pill:    { flex: 1, display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', background: INK, border: 'none', borderRadius: '3px', cursor: 'pointer', color: 'white', textAlign: 'left' },
  pillDow: { fontSize: '9px', fontFamily: NARROW, letterSpacing: '0.1em', color: '#999', flexShrink: 0 },
  pillDate:{ fontSize: '12px', fontWeight: '700', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  redDot:  { width: '5px', height: '5px', borderRadius: '50%', background: RED, flexShrink: 0 },
  caret:   { fontSize: '7px', color: '#777', flexShrink: 0 },
  cal:     { position: 'absolute', top: 'calc(100% + 5px)', left: 0, right: 0, background: 'white', borderWidth: '1px', borderStyle: 'solid', borderColor: BORDER, borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 200, overflow: 'hidden', minWidth: '210px' },
  calHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px 7px', borderBottom: '1px solid #eee', background: '#fafaf9' },
  calNavBtn:{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '18px', lineHeight: 1, padding: '2px 5px' },
  calTitle: { fontSize: '11px', fontWeight: '700', fontFamily: NARROW, letterSpacing: '0.08em', color: INK },
  calDowRow:{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '6px 10px 2px' },
  calDow:   { textAlign: 'center', fontSize: '9px', color: '#bbb', fontFamily: NARROW, padding: '2px 0' },
  calGrid:  { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', padding: '2px 10px 8px' },
  cell:     { position: 'relative', textAlign: 'center', fontSize: '11px', padding: '5px 1px', borderWidth: '1px', borderStyle: 'solid', borderColor: 'transparent', borderRadius: '3px', cursor: 'pointer', color: INK, fontFamily: SERIF },
  cellSel:  { background: INK, color: 'white', fontWeight: '700', borderColor: INK },
  cellToday:{ borderColor: RED, color: RED, fontWeight: '700' },
  cellOff:  { color: '#ddd', cursor: 'default', borderColor: 'transparent' },
  dataDot:  { position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '3px', height: '3px', borderRadius: '50%', background: RED },
  quickRow: { borderTop: '1px solid #eee', padding: '7px 10px', display: 'flex', gap: '4px', flexWrap: 'wrap', background: '#fafaf9' },
  quickBtn: { fontSize: '10px', fontFamily: NARROW, letterSpacing: '0.04em', padding: '3px 7px', borderWidth: '1px', borderStyle: 'solid', borderColor: BORDER, borderRadius: '3px', background: 'white', color: '#555', cursor: 'pointer' },
  archiveBadge: { marginTop: '6px', padding: '5px 8px', background: '#fdf6e3', borderWidth: '1px', borderStyle: 'solid', borderColor: '#e8d5a3', borderRadius: '3px', fontSize: '10px', fontFamily: NARROW, color: '#7a6030', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' },
  backBtn:  { background: 'none', borderWidth: 0, color: RED, fontFamily: NARROW, fontSize: '10px', cursor: 'pointer', letterSpacing: '0.04em', padding: 0 },
};