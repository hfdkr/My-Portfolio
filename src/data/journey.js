// Timeline, oldest first. kind: education | project | experience | learning | next.
// An entry with `experience` (index into src/data/experience.js) shows the full internship card.

export const journey = [
  {
    kind: "education",
    date: { en: "2024", fr: "2024" },
    title: { en: "Baccalaureate in physical sciences", fr: "Baccalauréat sciences physiques" },
    text: {
      en: "A science track, before I moved to development.",
      fr: "Une filière scientifique, avant de passer au développement.",
    },
  },
  {
    kind: "education",
    date: { en: "2025", fr: "2025" },
    title: {
      en: "Full-Stack Development at eWA Digitale",
      fr: "Développement Full-Stack à eWA Digitale",
    },
    text: {
      en: "Technicien Spécialisé en Développement Full Stack, Agadir (2025–2027). HTML, CSS, JavaScript, Tailwind CSS, and the Responsive Web Design certification from freeCodeCamp.",
      fr: "Technicien Spécialisé en Développement Full Stack, Agadir (2025–2027). HTML, CSS, JavaScript, Tailwind CSS, et la certification Responsive Web Design de freeCodeCamp.",
    },
  },
  {
    kind: "project",
    date: { en: "May – July 2026", fr: "Mai – juillet 2026" },
    title: { en: "Academic team projects", fr: "Projets académiques en équipe" },
    text: {
      en: "Task Flow and Code Arena with three classmates: Express APIs, authentication, Git branches and pull requests.",
      fr: "Task Flow et Code Arena avec trois camarades : API Express, authentification, branches Git et pull requests.",
    },
  },
  {
    kind: "experience",
    experience: 0,
    date: { en: "July – September 2026", fr: "Juillet – septembre 2026" },
    title: { en: "Front-end internship at Vala Blue", fr: "Stage front-end chez Vala Blue" },
  },
  {
    kind: "project",
    date: { en: "September – October 2026", fr: "Septembre – octobre 2026" },
    title: { en: "M3AK Morocco, continued", fr: "M3AK Morocco, la suite" },
    text: {
      en: "After the internship I kept working on it: French and Arabic with a right-to-left layout, a shared footer on all pages, an accessibility pass.",
      fr: "Après le stage, j’ai continué : français et arabe avec mise en page de droite à gauche, pied de page commun à toutes les pages, passe d’accessibilité.",
    },
  },
  {
    kind: "learning",
    current: true,
    date: { en: "Since October 2026", fr: "Depuis octobre 2026" },
    title: { en: "Second year: back-end and data", fr: "Deuxième année : back-end et données" },
    text: {
      en: "SQL, PostgreSQL and database design at eWA, alongside Node.js, Express and REST APIs.",
      fr: "SQL, PostgreSQL et conception de bases de données à eWA, en parallèle de Node.js, Express et des API REST.",
    },
    showFocus: true,
  },
  {
    kind: "next",
    date: { en: "Mid-March 2027", fr: "Mi-mars 2027" },
    title: { en: "PFE internship", fr: "Stage PFE" },
    text: {
      en: "Joining a team for my end-of-studies internship — after building one complete full-stack project on PostgreSQL.",
      fr: "Rejoindre une équipe pour mon stage de fin d’études — après avoir réalisé un projet full-stack complet sur PostgreSQL.",
    },
  },
];

export const focus = [
  { en: "Node.js and Express", fr: "Node.js et Express" },
  { en: "PostgreSQL and database design", fr: "PostgreSQL et conception de BDD" },
  { en: "REST API design", fr: "Conception d’API REST" },
  { en: "Full-stack architecture", fr: "Architecture full-stack" },
];
