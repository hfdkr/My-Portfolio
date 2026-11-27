// Small inline icons. All decorative (aria-hidden) — the text next to them carries the meaning.
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: "false",
};

export const SunIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

// Flips automatically in RTL via the "rtl:-scale-x-100" class where used.
export const ExternalIcon = (p) => (
  <svg {...base} width={14} height={14} {...p}>
    <path d="M8 16 16 8M9 8h7v7" />
  </svg>
);

export const CopyIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
    <path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" />
  </svg>
);

export const CheckIcon = (p) => (
  <svg {...base} width={16} height={16} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

// Figma-style "frame" glyph, used in the layers list.
export const FrameGlyph = (p) => (
  <svg {...base} width={14} height={14} strokeWidth={1.5} {...p}>
    <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />
  </svg>
);
