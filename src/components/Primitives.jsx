// Small building blocks shared by every section.
import { useId } from "react";
import { usePrefs } from "../lib/preferences";
import InteractiveText from "./InteractiveText";

/** Section opener: eyebrow + big headline title + intro, on the 12-column grid. */
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

/**
 * The identity mark: a ring of liquid metal holding ⵣ (yaz), the Amazigh sign of the free person —
 * drawn as strokes, so it is crisp at every size and needs no font.
 * `chrome` paints it with the signature gradient (cobalt → ultraviolet → champagne).
 */
export function Mark({ size = 18, className = "", chrome = false }) {
  const id = useId();
  const paint = chrome ? `url(#${id})` : "currentColor";
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" className={className} aria-hidden="true" focusable="false">
      {chrome && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7f9aff" />
            <stop offset="0.5" stopColor="#8957e5" />
            <stop offset="1" stopColor="#d8bd87" />
          </linearGradient>
        </defs>
      )}
      <circle r="10.4" fill="none" stroke={paint} strokeWidth="1.9" />
      <path d={YAZ} fill="none" stroke={paint} strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

/** ⵣ as a path (viewBox centred on 0,0, about 13 units tall): a stem, an open cup above, an arch below. */
export const YAZ = "M0-6.6V6.6M-4.4-6.1C-4.4-3.3-2.4-1.5 0-1.5S4.4-3.3 4.4-6.1M-4.4 6.1C-4.4 3.3-2.4 1.5 0 1.5S4.4 3.3 4.4 6.1";

/** A Tifinagh word, set as identity (not as content): `lang` for the browser, a translation for screen readers. */
export function Tifinagh({ text, meaning, className = "" }) {
  return (
    <span className={`tfng ${className}`}>
      <span lang="zgh-Tfng" aria-hidden="true">
        {text}
      </span>
      <span className="sr-only">{meaning}</span>
    </span>
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
