import { usePrefs } from "../lib/preferences";
import { useLocalTime, LOCALES } from "../lib/hooks";
import { profile } from "../data/profile";

export default function Footer() {
  const { t, lang } = usePrefs();
  const time = useLocalTime(profile.timeZone, LOCALES[lang]);
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 pt-8 pb-28 text-sm text-muted sm:px-8 sm:pb-24">
        <p>
          {t("footer.built")} <span className="tnum">© {new Date().getFullYear()}</span>
        </p>
        <p className="hidden md:block">{t("footer.hint")}</p>
        <p className="flex items-center gap-5">
          {time && (
            <span className="mono text-xs">
              {t("term.date.agadir")} <time className="tnum">{time}</time>
            </span>
          )}
          <a href="#top" className="link-line text-ink">
            {t("footer.top")}
          </a>
        </p>
      </div>
    </footer>
  );
}
