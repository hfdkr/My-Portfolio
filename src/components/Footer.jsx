import { usePrefs } from "../lib/preferences";
import { scrollToSection } from "../lib/ui";
import { Mark } from "./Primitives";
import InteractiveText from "./InteractiveText";

export default function Footer() {
  const { t, lang } = usePrefs();
  const name = "Hafid Karkouch";
  return (
    <footer className="relative z-[1] overflow-hidden border-t border-line pt-14">
      <div className="gutter mx-auto grid max-w-[1440px] gap-6 text-sm text-muted md:grid-cols-12 md:gap-8">
        <p className="flex items-center gap-2.5 text-ink-2 md:col-span-3">
          <Mark size={14} className="text-accent" />
          {t("footer.built")}
          <span lang="zgh-Tfng" className="tfng text-muted" aria-hidden="true">
            ⴰⴳⴰⴷⵉⵔ
          </span>
        </p>
        <p className="mono text-[11px] md:col-span-5">{t("footer.hint")}</p>
        <div className="flex items-center justify-between gap-6 md:col-span-4 md:justify-end">
          <p className="mono text-[11px]" title="↑ ↑ ↓ ↓ ← → ← → B A">
            {t("footer.secret")}
          </p>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("top");
            }}
            className="link-line py-1 text-ink"
          >
            {t("footer.top")} ↑
          </a>
        </div>
      </div>
      {/* the signature: the name, cut by the bottom edge */}
      {/* hover it: the faded letters light up one by one */}
      <InteractiveText as="p" text={name} variant="footer" className="display mt-12 whitespace-nowrap text-center text-[clamp(4rem,17vw,17rem)] leading-[0.75] text-ink/[0.07]" aria-hidden="true" />
    </footer>
  );
}
