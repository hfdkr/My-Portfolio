// Small building blocks shared by every section.
import { usePrefs } from "../lib/preferences";
import InteractiveText from "./InteractiveText";

/** Section opener: eyebrow + big serif title + intro, on the 12-column grid. */
export function SectionHead({ id, eyebrow, title, intro, children }) {
  // SplitText rewrites the heading's DOM, so React must never reconcile inside it:
  // keying by language makes a language switch replace the whole element instead.
  const { lang } = usePrefs();
  return (
    <header className="gutter mx-auto grid max-w-[1440px] gap-y-6 md:grid-cols-12 md:gap-x-8">
      <p className="eyebrow md:col-span-3" data-reveal>
        {eyebrow}
      </p>
      <div className="md:col-span-9">
        <InteractiveText as="h2" key={lang} id={id} text={title} className="display text-[clamp(2.6rem,7vw,6.4rem)]" data-split />
        {intro && (
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted" data-reveal>
            {intro}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

/** Green glaze dot with a slow ring — "available". */
export function LiveDot({ className = "" }) {
  return (
    <span className={`relative inline-flex h-2 w-2 shrink-0 ${className}`} aria-hidden="true">
      <span className="pulse-ring absolute inset-0 rounded-full bg-glaze" />
      <span className="relative h-2 w-2 rounded-full bg-glaze" />
    </span>
  );
}

/** Eight-point star — the identity mark. */
export function Star({ size = 18, className = "", strokeWidth = 0, filled = true }) {
  // two squares, one rotated 45°
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M0-11 3.2-7.7 7.8-7.8 7.7-3.2 11 0 7.7 3.2 7.8 7.8 3.2 7.7 0 11-3.2 7.7-7.8 7.8-7.7 3.2-11 0-7.7-3.2-7.8-7.8-3.2-7.7Z"
        fill={filled ? "currentColor" : "none"}
        stroke={strokeWidth ? "currentColor" : "none"}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const ArrowIcon = ({ className = "" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`rtl:-scale-x-100 ${className}`} aria-hidden="true" focusable="false">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export const ArrowUpRight = ({ className = "" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`rtl:-scale-x-100 ${className}`} aria-hidden="true" focusable="false">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
