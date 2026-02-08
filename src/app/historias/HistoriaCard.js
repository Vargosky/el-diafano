"use client";

import { useMemo, useState } from "react";

export default function HistoriaCard({ h, onSelect }) {
  const placeholder =
    "https://via.placeholder.com/1200x800/0b1220/ffffff?text=Sin+Imagen";

  const [src, setSrc] = useState(h?.portada_url || placeholder);

  const fuentes = useMemo(() => {
    const raw = h?.fuentes_lista ? String(h.fuentes_lista) : "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [h?.fuentes_lista]);

  const titulo = (h?.titulo_generado || "Historia sin título").trim();

  return (
    <button
      type="button"
      onClick={() => onSelect?.(h)}
      aria-label={`Abrir historia: ${titulo}`}
      className="
        group relative w-full overflow-hidden rounded-2xl text-left
        border border-white/10 bg-[#0b1220]
        shadow-[0_12px_35px_-15px_rgba(0,0,0,0.9)]
        transition-transform duration-200
        hover:-translate-y-1
      "
      style={{ height: 260 }}
    >
      {/* IMAGEN */}
      <img
        src={src}
        alt={titulo}
        loading="lazy"
        decoding="async"
        onError={() => setSrc(placeholder)}
        className="
          absolute inset-0 z-0 h-full w-full object-cover
          transition duration-300
          group-hover:scale-[1.03]
        "
      />

      {/* OVERLAY SUAVE (muy leve) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

      {/* MEDIOS (arriba, discretos) */}
      <div
        className="
          absolute top-4 left-4 z-30
          flex gap-2
          rounded-xl
          bg-black/55 backdrop-blur-md
          border border-white/25
          px-3 py-2
        "
      >
        {fuentes.slice(0, 3).map((m, i) => (
          <span
            key={`${h?.id}-fuente-${i}`}
            className="
              px-3 py-1
              rounded-full
              bg-white/10
              border border-white/35
              text-white text-[10px]
              font-extrabold uppercase tracking-wide
            "
          >
            {m}
          </span>
        ))}
      </div>

      {/* ─────────────────────────────
          TÍTULO ABAJO (SIN CTA)
         ───────────────────────────── */}
      <div className="absolute bottom-3 left-0 right-0 z-20 px-5">
        <h3
          className="
            text-white font-black uppercase leading-tight
            text-[16px] sm:text-[18px]
            line-clamp-3
          "
          style={{
            textShadow: `
              -1px -1px 0 #000,
               1px -1px 0 #000,
              -1px  1px 0 #000,
               1px  1px 0 #000,
               0px  3px 8px rgba(0,0,0,0.9)
            `,
          }}
        >
          {titulo}
        </h3>
      </div>
    </button>
  );
}
