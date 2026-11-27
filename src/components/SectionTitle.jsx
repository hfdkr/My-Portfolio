import { useLayoutEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { usePrefersReducedMotion } from "../lib/hooks";

/** Section heading: the title slides up from a mask as it enters, the rule draws from the start edge. */
export default function SectionTitle({ id, title, intro, className = "" }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  useLayoutEffect(() => {
    if (reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 80%" } });
      tl.from(".st-title", { yPercent: 105, duration: 1.1, ease: "expo.out" })
        .from(".st-rule", { scaleX: 0, duration: 1.2, ease: "expo.out" }, 0.1)
        .from(".st-intro", { y: 20, opacity: 0, duration: 0.9, ease: "expo.out" }, 0.25);
    }, ref);
    return () => ctx.revert();
  }, [reduced, title]);
  return (
    <div ref={ref} className={`mx-auto mb-14 max-w-[1440px] px-5 sm:px-8 md:mb-20 ${className}`}>
      <div className="grid items-end gap-6 md:grid-cols-12">
        <h2 id={id} className="display overflow-hidden pb-[0.08em] text-[clamp(2.4rem,7vw,6rem)] md:col-span-7">
          <span className="st-title block">{title}</span>
        </h2>
        {intro && <p className="st-intro max-w-[52ch] text-muted md:col-span-5">{intro}</p>}
      </div>
      <div className="st-rule mt-8 h-px origin-[0%_50%] bg-gradient-to-r from-accent via-line-strong to-transparent rtl:origin-[100%_50%] rtl:bg-gradient-to-l" aria-hidden="true" />
    </div>
  );
}
