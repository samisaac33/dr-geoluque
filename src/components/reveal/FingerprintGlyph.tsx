"use client";

interface FingerprintGlyphProps {
  active: boolean;
  glyphId: string;
  className?: string;
}

/** Huella biométrica estilizada (vector) con núcleo tipo “genoma”. */
export function FingerprintGlyph({
  active,
  glyphId,
  className = "",
}: FingerprintGlyphProps) {
  const coreId = `fpCore-${glyphId}`;
  const strokeId = `fpStroke-${glyphId}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={`pointer-events-none absolute inset-2 ${className}`}
      aria-hidden
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="48%" r="50%">
          <stop offset="0%" stopColor={active ? "#fef3c7" : "#94a3b8"} stopOpacity={active ? 0.9 : 0.35} />
          <stop offset="100%" stopColor={active ? "#f59e0b" : "#475569"} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={active ? "#fff7ed" : "#cbd5e1"} />
          <stop offset="100%" stopColor={active ? "#fcd34d" : "#64748b"} />
        </linearGradient>
      </defs>

      <circle cx="60" cy="58" r="38" fill={`url(#${coreId})`} opacity={active ? 0.85 : 0.5} />

      {/* Doble hélice minimal (sutil, no “spoilera” el sexo) */}
      <path
        d="M60 32 C48 42 48 52 60 58 C72 64 72 74 60 84"
        fill="none"
        stroke={active ? "rgba(255,251,235,0.35)" : "rgba(148,163,184,0.25)"}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M54 36 C42 46 42 56 54 62 C66 68 66 78 54 88"
        fill="none"
        stroke={active ? "rgba(253,224,171,0.45)" : "rgba(100,116,139,0.2)"}
        strokeWidth="0.9"
        strokeLinecap="round"
      />
      <path
        d="M66 36 C78 46 78 56 66 62 C54 68 54 78 66 88"
        fill="none"
        stroke={active ? "rgba(253,224,171,0.45)" : "rgba(100,116,139,0.2)"}
        strokeWidth="0.9"
        strokeLinecap="round"
      />

      {/* Arcos tipo huella dactilar */}
      <g
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeLinecap="round"
        strokeWidth={active ? 1.8 : 1.3}
        opacity={active ? 1 : 0.75}
      >
        <path d="M60 26c-14 8-22 22-22 36s8 28 22 36" />
        <path d="M60 30c-10 6-16 16-16 28s6 22 16 28" />
        <path d="M38 44c-2 8-2 18 2 26" />
        <path d="M82 44c2 8 2 18-2 26" />
        <path d="M44 56c0 8 3 14 7 18" />
        <path d="M76 56c0 8-3 14-7 18" />
        <path d="M52 66c4 5 8 5 16 0" />
        <ellipse cx="60" cy="58" rx="7" ry="5.5" strokeWidth={active ? 2 : 1.4} />
      </g>

      {/* Puntos de lectura */}
      {[
        [60, 58],
        [48, 50],
        [72, 50],
        [45, 68],
        [75, 68],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={active ? 1.8 : 1.2}
          fill={active ? "#fde68a" : "#94a3b8"}
          opacity={active ? 0.95 : 0.4}
        />
      ))}
    </svg>
  );
}