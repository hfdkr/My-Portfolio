// Terminal command engine. Command names are English and language-independent;
// their output follows the current site language.
// A line is an array of segments: { t: text, c?: "accent" | "dim" | "ok" | "warn" | "err" | "title", href?: url }.

import { profile } from "../data/profile";
import { projects } from "../data/projects";
import { experience } from "../data/experience";
import { skills, skillGroups } from "../data/skills";
import { journey } from "../data/journey";
import { lab } from "../data/lab";
import { SECTIONS } from "./ui";

export const COMMANDS = [
  "help", "about", "whoami", "skills", "projects", "lab", "experience", "education",
  "contact", "github", "social", "date", "clear", "lang", "theme", "goto", "open", "exit",
];

const ARGS = {
  lang: ["en", "fr", "ar"],
  theme: ["dark", "light"],
  goto: SECTIONS,
  open: projects.map((p) => p.id),
};

const seg = (t, c, href) => ({ t, c, href });
const line = (...parts) => parts.map((p) => (typeof p === "string" ? seg(p) : p));
const blank = () => [seg("")];

/** Tab completion: returns the completed input, or the list of candidates when ambiguous. */
export function complete(input) {
  const parts = input.trimStart().split(/\s+/);
  if (parts.length <= 1) {
    const hits = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
    if (hits.length === 1) return { value: hits[0] + (ARGS[hits[0]] ? " " : ""), options: [] };
    return { value: input, options: hits };
  }
  const [cmd, arg = ""] = parts;
  const pool = ARGS[cmd.toLowerCase()] || [];
  const hits = pool.filter((a) => a.startsWith(arg.toLowerCase()));
  if (hits.length === 1) return { value: `${cmd} ${hits[0]}`, options: [] };
  return { value: input, options: hits };
}

/**
 * Run one command.
 * ctx: { t, pick, lang, theme, setLang, setTheme, goto, close }
 * returns { lines, clear?, close? }
 */
export function run(raw, ctx) {
  const { t, pick } = ctx;
  const [name = "", ...args] = raw.trim().split(/\s+/);
  const cmd = name.toLowerCase();
  const arg = (args[0] || "").toLowerCase();
  const L = [];

  switch (cmd) {
    case "": return { lines: [] };

    case "help": {
      L.push(line(seg(t("term.help.title"), "title")));
      for (const c of COMMANDS) L.push(line(seg(c.padEnd(12), "accent"), seg(t(`term.help.${c}`), "dim")));
      L.push(blank());
      L.push(line(seg(t("term.help.secret"), "dim")));
      break;
    }

    case "whoami": {
      L.push(line(seg(profile.name, "title")));
      L.push(line(t("term.whoami.role")));
      L.push(line(t("term.whoami.place")));
      L.push(line(seg(t("term.whoami.line"), "dim")));
      break;
    }

    case "about": {
      L.push(line(seg(`${profile.name} — ${t("hero.role1")}`, "title")));
      L.push(blank());
      L.push(line(t("about.p1")));
      L.push(blank());
      L.push(line(t("about.p2")));
      L.push(blank());
      for (const f of profile.facts) L.push(line(seg(`${t(f.label)}: `, "dim"), f.href ? seg(pick(f.value), "accent", f.href) : pick(f.value)));
      break;
    }

    case "skills": {
      for (const g of skillGroups) {
        const items = skills.filter((s) => s.group === g.id);
        L.push(line(seg(`${pick(g.title)}:`, "title")));
        L.push(
          items.flatMap((s, i) => {
            const n = pick(s.name);
            const parts = [seg(n, s.status === "learning" ? "warn" : undefined)];
            if (s.status === "learning") parts.push(seg(` (${t("term.learning")})`, "dim"));
            if (i < items.length - 1) parts.push(seg(", ", "dim"));
            return parts;
          }),
        );
      }
      break;
    }

    case "projects": {
      projects.forEach((p, i) => {
        if (i) L.push(blank());
        L.push(line(seg(p.name, "title"), seg(`  ${pick(p.context)}, ${p.year}`, "dim")));
        L.push(line(pick(p.summary)));
        L.push(line(seg("code  ", "dim"), seg(p.repo.replace("https://", ""), "accent", p.repo)));
        if (p.live) L.push(line(seg("live  ", "dim"), seg(p.live.replace("https://", "").replace(/\/$/, ""), "accent", p.live)));
        L.push(line(seg(`→ open ${p.id}`, "dim")));
      });
      break;
    }

    case "open": {
      const p = projects.find((x) => x.id === arg);
      if (!p) {
        L.push(line(seg(t("term.open.unknown", { name: arg || "?", list: projects.map((x) => x.id).join(", ") }), "err")));
        break;
      }
      L.push(line(seg(p.name, "title"), seg(`  ${pick(p.context)}, ${p.year}`, "dim")));
      L.push(line(pick(p.summary)));
      L.push(blank());
      L.push(line(seg(t("work.myPart"), "accent")));
      L.push(line(pick(p.myPart)));
      L.push(blank());
      L.push(line(seg(t("work.features"), "accent")));
      for (const f of pick(p.features)) L.push(line(seg("• ", "dim"), f));
      L.push(blank());
      L.push(line(seg(`${t("work.stack")}: `, "dim"), p.stack.join(", ")));
      L.push(line(seg("code  ", "dim"), seg(p.repo, "accent", p.repo)));
      if (p.live) L.push(line(seg("live  ", "dim"), seg(p.live, "accent", p.live)));
      break;
    }

    case "lab": {
      lab.forEach((a, i) => {
        if (i) L.push(blank());
        L.push(line(seg(pick(a.name), "title"), seg(`  ${pick(a.kind)}, ${a.year}`, "dim")));
        L.push(line(pick(a.summary)));
        for (const [method, path, codes] of a.routes) L.push(line(seg(method.padEnd(7), "warn"), path.padEnd(18), seg(codes, "dim")));
        L.push(line(seg("code  ", "dim"), seg(a.repo.replace("https://", ""), "accent", a.repo)));
      });
      break;
    }

    // ---- not listed in help: small rewards for the curious ----
    case "sudo": {
      L.push(line(seg(t("term.sudo"), "warn")));
      break;
    }
    case "coffee": {
      L.push(line(seg("   ( (", "dim")));
      L.push(line(seg("    ) )", "dim")));
      L.push(line(seg("  ........", "accent")));
      L.push(line(seg("  |      |]", "accent")));
      L.push(line(seg("  \      /", "accent")));
      L.push(line(seg("   `----'", "accent")));
      L.push(line(t("term.coffee")));
      break;
    }
    case "mercury":
    case "chrome": {
      L.push(line(seg(t("term.mercury"), "ok")));
      return { lines: L, wave: true };
    }
    case "hire": {
      L.push(line(seg(t("term.hire"), "ok")));
      return { lines: L, goto: "contact" };
    }
    case "rm": {
      L.push(line(seg(t("term.rm"), "err")));
      break;
    }
    case "ls": {
      L.push(line(seg("about.md  work/  lab/  toolbox.json  journey.log  contact.txt  ", "accent"), seg(".secrets", "dim")));
      break;
    }
    case "cat": {
      if (arg === ".secrets") L.push(line(seg("↑ ↑ ↓ ↓ ← → ← → B A", "warn")));
      else L.push(line(seg(t("term.usage", { usage: "cat .secrets" }), "dim")));
      break;
    }

    case "experience": {
      for (const job of experience) {
        L.push(line(seg(pick(job.role), "title")));
        L.push(line(job.company, seg(`  ${pick(job.place)}, ${pick(job.period)}`, "dim")));
        L.push(line(pick(job.summary)));
        L.push(blank());
        L.push(line(seg(t("journey.interfaces"), "accent")));
        for (const it of job.interfaces) L.push(line(seg("• ", "dim"), pick(it)));
        L.push(blank());
        L.push(line(seg(`${t("term.experience.after")}: `, "dim"), pick(job.after)));
      }
      break;
    }

    case "education": {
      for (const j of journey.filter((x) => x.kind === "education")) {
        L.push(line(seg(pick(j.date).padEnd(6), "accent"), seg(pick(j.title), "title")));
        L.push(line(seg("      "), seg(pick(j.text), "dim")));
      }
      const cert = profile.facts.find((f) => f.href);
      if (cert) L.push(line(seg(`${t("term.education.cert")}: `, "dim"), seg(pick(cert.value), "accent", cert.href)));
      break;
    }

    case "contact": {
      L.push(line(seg("email     ", "dim"), seg(profile.email, "accent", `mailto:${profile.email}`)));
      L.push(line(seg("linkedin  ", "dim"), seg(profile.links.linkedin.replace("https://www.", ""), "accent", profile.links.linkedin)));
      L.push(line(seg(t("status.text"), "ok")));
      break;
    }

    case "github": {
      L.push(line(seg(profile.links.github, "accent", profile.links.github)));
      break;
    }

    case "social": {
      L.push(line(seg("github    ", "dim"), seg(profile.links.github, "accent", profile.links.github)));
      L.push(line(seg("linkedin  ", "dim"), seg(profile.links.linkedin, "accent", profile.links.linkedin)));
      L.push(line(seg("email     ", "dim"), seg(profile.email, "accent", `mailto:${profile.email}`)));
      break;
    }

    case "date": {
      const fmt = (tz) =>
        new Intl.DateTimeFormat(ctx.locale, { dateStyle: "full", timeStyle: "short", ...(tz ? { timeZone: tz } : {}) }).format(new Date());
      L.push(line(seg(`${t("term.date.here")}: `, "dim"), fmt()));
      L.push(line(seg(`${t("term.date.agadir")}: `, "dim"), fmt(profile.timeZone)));
      break;
    }

    case "lang": {
      if (!ARGS.lang.includes(arg)) {
        L.push(line(seg(t("term.usage", { usage: "lang en | fr | ar" }), "err")));
        break;
      }
      ctx.setLang(arg);
      return { lines: [], after: "lang" };
    }

    case "theme": {
      const next = arg || (ctx.theme === "dark" ? "light" : "dark");
      if (!ARGS.theme.includes(next)) {
        L.push(line(seg(t("term.usage", { usage: "theme dark | light" }), "err")));
        break;
      }
      ctx.setTheme(next);
      L.push(line(seg(t("term.theme.done", { theme: next }), "ok")));
      break;
    }

    case "goto": {
      if (!SECTIONS.includes(arg)) {
        L.push(line(seg(t("term.usage", { usage: `goto ${SECTIONS.join(" | ")}` }), "err")));
        break;
      }
      L.push(line(seg(t("term.goto.done", { section: t(`nav.${arg}`) }), "ok")));
      return { lines: L, goto: arg };
    }

    case "clear": return { lines: [], clear: true };
    case "exit": return { lines: [], close: true };

    default:
      L.push(line(seg(t("term.notFound", { cmd: name }), "err")));
  }
  return { lines: L };
}
