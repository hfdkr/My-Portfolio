/** Flat version of the 3D object — shown while the 3D loads, or instead of it without WebGL. */
export default function StackFallback({ caption, compact }) {
  return (
    <div className={`flex h-full w-full flex-col items-center ${compact ? "justify-start pt-[12vh]" : "justify-center"}`}>
      <svg viewBox="0 0 320 300" className="w-[min(62vw,420px)] drop-shadow-[0_30px_60px_var(--accent-glow)]" aria-hidden="true">
        <defs>
          <linearGradient id="fb-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--cyan)" stopOpacity=".25" />
          </linearGradient>
          <linearGradient id="fb-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--muted)" stopOpacity=".55" />
            <stop offset="1" stopColor="var(--muted)" stopOpacity=".2" />
          </linearGradient>
        </defs>
        {/* data layer: wireframe, being built */}
        <g transform="translate(0 150)">
          <path d="M160 20 290 85 160 150 30 85Z" fill="var(--amber-glow)" stroke="var(--amber)" strokeWidth="1.5" strokeDasharray="5 4" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${100 + i * 30} ${68 + i * 15} l30 15 -30 15 -30 -15Z`} fill="var(--amber)" opacity={0.75 - i * 0.2} />
          ))}
        </g>
        {/* logic layer: metal */}
        <g transform="translate(0 78)">
          <path d="M160 20 290 85 160 150 30 85Z" fill="url(#fb-metal)" stroke="var(--cyan)" strokeWidth="1.5" />
          <ellipse cx="160" cy="85" rx="34" ry="17" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeDasharray="60 20" />
        </g>
        {/* interface layer: glass */}
        <g transform="translate(0 6)">
          <path d="M160 20 290 85 160 150 30 85Z" fill="url(#fb-glass)" stroke="var(--accent)" strokeWidth="1.5" />
          <path d="M160 46 236 84 222 91 146 53Z" fill="var(--accent)" opacity=".8" />
          <path d="M120 70 160 90 140 100 100 80Z M170 95 210 115 190 125 150 105Z" fill="var(--accent)" opacity=".45" />
        </g>
        <line x1="160" y1="40" x2="160" y2="290" stroke="var(--cyan)" strokeWidth="2" opacity=".6" />
      </svg>
      {caption && <p className="mt-4 max-w-xs text-center text-xs text-muted">{caption}</p>}
    </div>
  );
}
