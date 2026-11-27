import { Fragment, memo, useMemo } from "react";

/* ----------------------------------------------------------------------------
   INTERACTIVE TEXT — letters that react one at a time.

   <InteractiveText as="h2" variant="title" text="Three projects, *told honestly*." />

   Structure, per character:   .it-c  (outer — GSAP entrance animates this)
                                 └ .it-g (inner — CSS hover animates this)
   Two layers so a scroll entrance and a hover never fight over `transform`.

   - Hover is pure CSS (:hover + :has() for the neighbours): no JS, no re-render.
   - Words stay unbreakable (.it-w), spaces stay real text nodes, so wrapping,
     punctuation and selection behave like normal text.
   - Arabic is never split into letters (that would break letter joining):
     each Arabic word reacts as one unit instead.
   - Screen readers get the plain text once; the visual glyphs are aria-hidden.
   - *asterisks* mark an italic accent segment, like in the section titles.
   Variants (see index.css): hero · title · nav · skill · word · cta · footer
---------------------------------------------------------------------------- */

const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** "*italic*" segments → [{ em, text }] */
function segments(text) {
  return String(text)
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((s) => (s.length > 2 && s.startsWith("*") && s.endsWith("*") ? { em: true, text: s.slice(1, -1) } : { em: false, text: s }));
}

function glyphs(text, counter, breakable) {
  return text.split(/(\s+)/).map((part, w) => {
    if (!part) return null;
    if (/^\s+$/.test(part)) return part; // real spaces: wrapping and copy/paste stay natural
    if (ARABIC.test(part)) {
      const i = counter.i++;
      return (
        <span key={w} className="it-c it-w" style={{ "--i": i }}>
          <span className="it-g">{part}</span>
        </span>
      );
    }
    return (
      <span key={w} className={breakable ? "it-w it-w-break" : "it-w"}>
        {Array.from(part).map((ch, c) => {
          const i = counter.i++;
          return (
            <span key={c} className="it-c" style={{ "--i": i }}>
              <span className="it-g">{ch}</span>
            </span>
          );
        })}
      </span>
    );
  });
}

/**
 * @param {{
 *   text: string,
 *   as?: keyof JSX.IntrinsicElements,
 *   variant?: "hero" | "title" | "nav" | "skill" | "word" | "cta" | "footer",
 *   color?: string,          // hover colour (CSS colour or var)
 *   duration?: number,       // ms, release duration (hover-in is ~half)
 *   lift?: number,           // em, vertical movement of the hovered letter
 *   scale?: number,          // scale of the hovered letter
 *   stagger?: number,        // s, entrance stagger when used with data-split
 *   breakable?: boolean,     // allow breaks inside long words (e-mail address)
 *   emClassName?: string,    // class of the *italic* segment
 *   className?: string,
 * }} props
 */
function InteractiveText({
  text,
  as: Tag = "span",
  variant = "title",
  color,
  duration,
  lift,
  scale,
  stagger,
  breakable = false,
  emClassName = "text-accent",
  className = "",
  style,
  ...rest
}) {
  const content = useMemo(() => {
    const counter = { i: 0 };
    return segments(text).map((seg, k) =>
      seg.em ? (
        <em key={k} className={emClassName}>
          {glyphs(seg.text, counter, breakable)}
        </em>
      ) : (
        <Fragment key={k}>{glyphs(seg.text, counter, breakable)}</Fragment>
      ),
    );
  }, [text, breakable, emClassName]);

  const vars = {
    ...(color && { "--it-fixed": color }),
    ...(duration && { "--it-dur": `${duration}ms` }),
    ...(lift != null && { "--it-lift": `${lift}em` }),
    ...(scale && { "--it-scale": scale }),
    ...style,
  };

  return (
    <Tag className={`it ${className}`} data-variant={variant} data-stagger={stagger} style={vars} {...rest}>
      <span className="sr-only select-none">{String(text).replace(/\*/g, "")}</span>
      <span aria-hidden="true">{content}</span>
    </Tag>
  );
}

export default memo(InteractiveText);

/**
 * A paragraph where only the {marked} words are interactive — readability first.
 * "I {design} interfaces…" → "design" reacts letter by letter.
 */
export const Marked = memo(function Marked({ text, variant = "word", className = "" }) {
  const parts = String(text).split(/(\{[^}]+\})/g);
  return parts.map((p, i) =>
    p.startsWith("{") && p.endsWith("}") ? (
      <InteractiveText key={i} text={p.slice(1, -1)} variant={variant} className={className} />
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
});

/** Plain text without the {markers}, for places that only need the words. */
export const unmark = (text) => String(text).replace(/[{}]/g, "");
