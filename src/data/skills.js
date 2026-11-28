// Skills universe. status: "practice" (used in real work) | "learning" (studying it now).
// where: evidence, as project names. links: other skill ids drawn as connections in 3D.

export const skillGroups = [
  { id: "frontend", colorLight: "#4a3dd0", color: "#8b7dff", title: { en: "Front-end", fr: "Front-end" } },
  { id: "backend", colorLight: "#0a7c9c", color: "#52e0ff", title: { en: "Back-end", fr: "Back-end" } },
  { id: "database", colorLight: "#8f5e00", color: "#ffb547", title: { en: "Database", fr: "Bases de données" } },
  { id: "design", colorLight: "#b0306f", color: "#ff7ac6", title: { en: "Design", fr: "Design" } },
  { id: "tools", colorLight: "#3f7d1f", color: "#9be27a", title: { en: "Tools", fr: "Outils" } },
];

const eWA = { en: "eWA, 2nd year", fr: "eWA, 2e année" };

export const skills = [
  // Front-end
  {
    id: "html", group: "frontend", name: "HTML5", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["css", "js"],
    desc: {
      en: "Semantic structure, forms and accessible markup — the base of every page I build.",
      fr: "Structure sémantique, formulaires et balisage accessible — la base de chaque page que je construis.",
    },
  },
  {
    id: "css", group: "frontend", name: "CSS3", status: "practice", where: ["M3AK", "Code Arena"], links: ["tailwind"],
    desc: {
      en: "Layout with flexbox and grid, custom properties for theming, responsive rules.",
      fr: "Mise en page avec flexbox et grid, variables CSS pour les thèmes, règles responsives.",
    },
  },
  {
    id: "js", group: "frontend", name: "JavaScript", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["node"],
    desc: {
      en: "DOM, events, fetch, localStorage and small modules — vanilla, no framework needed.",
      fr: "DOM, événements, fetch, localStorage et petits modules — en natif, sans framework.",
    },
  },
  {
    id: "tailwind", group: "frontend", name: "Tailwind CSS", status: "practice", where: ["M3AK", "Task Flow"], links: ["figma"],
    desc: {
      en: "My daily styling tool, including v4 design tokens, dark mode and RTL variants.",
      fr: "Mon outil de style au quotidien, y compris les tokens de la v4, le mode sombre et les variantes RTL.",
    },
  },
  {
    id: "responsive", group: "frontend", name: { en: "Responsive UI", fr: "Interfaces responsives" }, status: "practice", where: ["M3AK"], links: ["css"],
    desc: {
      en: "Desktop and mobile mockups turned into pages that hold up on every screen.",
      fr: "Des maquettes desktop et mobile transformées en pages qui tiennent sur tous les écrans.",
    },
  },
  {
    id: "i18n", group: "frontend", name: { en: "i18n & RTL", fr: "i18n et RTL" }, status: "practice", where: ["M3AK"], links: ["js"],
    desc: {
      en: "English, French and Arabic interfaces, with a full right-to-left layout.",
      fr: "Interfaces en anglais, français et arabe, avec mise en page complète de droite à gauche.",
    },
  },
  {
    id: "react", group: "frontend", name: "React", status: "learning", where: [], links: ["js"],
    desc: {
      en: "Components, props and state — the next step after vanilla JavaScript, learning it now.",
      fr: "Composants, props et état — l’étape après le JavaScript natif, en cours d’apprentissage.",
    },
  },
  // Back-end
  {
    id: "node", group: "backend", name: "Node.js", status: "learning", where: ["Task Flow", "Code Arena"], links: ["express"],
    desc: {
      en: "Running JavaScript on the server: modules, file system, async code.",
      fr: "JavaScript côté serveur : modules, système de fichiers, code asynchrone.",
    },
  },
  {
    id: "express", group: "backend", name: "Express.js", status: "learning", where: ["Task Flow", "Code Arena", "API ParcAuto"], links: ["rest", "auth"],
    desc: {
      en: "Routes, middleware and error handling, split into files that stay readable.",
      fr: "Routes, middlewares et gestion des erreurs, découpés en fichiers qui restent lisibles.",
    },
  },
  {
    id: "rest", group: "backend", name: { en: "REST APIs", fr: "API REST" }, status: "learning", where: ["Task Flow", "Code Arena", "API ParcAuto"], links: ["sql"],
    desc: {
      en: "CRUD endpoints consumed by a vanilla front-end: resources, status codes, validation.",
      fr: "Endpoints CRUD consommés par un front-end natif : ressources, codes de statut, validation.",
    },
  },
  {
    id: "auth", group: "backend", name: { en: "Auth: sessions, JWT", fr: "Auth : sessions, JWT" }, status: "learning", where: ["Task Flow", "Code Arena"], links: [],
    desc: {
      en: "Session cookies and JWT, bcrypt hashing, rate-limited login, one-time reset links.",
      fr: "Cookies de session et JWT, hachage bcrypt, connexion limitée, liens de réinitialisation à usage unique.",
    },
  },
  // Database
  {
    id: "sql", group: "database", name: "SQL", status: "learning", where: [eWA], links: ["postgres"],
    desc: {
      en: "Queries, joins and constraints, studied this year at eWA Digitale.",
      fr: "Requêtes, jointures et contraintes, étudiées cette année à eWA Digitale.",
    },
  },
  {
    id: "postgres", group: "database", name: "PostgreSQL", status: "learning", where: [eWA], links: ["dbdesign"],
    desc: {
      en: "The database I’m learning now — next step: use it in a complete project.",
      fr: "La base de données que j’apprends en ce moment — prochaine étape : l’utiliser dans un projet complet.",
    },
  },
  {
    id: "dbdesign", group: "database", name: { en: "DB design & UML", fr: "Conception BDD et UML" }, status: "learning", where: [eWA], links: [],
    desc: {
      en: "Modelling entities and relations with UML before turning them into tables.",
      fr: "Modéliser entités et relations en UML avant de les traduire en tables.",
    },
  },
  // Design
  {
    id: "figma", group: "design", name: "Figma", status: "practice", where: ["M3AK"], links: ["uiux"],
    desc: {
      en: "Where my interfaces start: layouts, components and both themes before code.",
      fr: "Là où mes interfaces commencent : mises en page, composants et deux thèmes avant le code.",
    },
  },
  {
    id: "uiux", group: "design", name: { en: "UI/UX design", fr: "Design UI/UX" }, status: "practice", where: ["M3AK"], links: ["responsive"],
    desc: {
      en: "Clear journeys, consistent pages and accessible states, tested on real screens.",
      fr: "Des parcours clairs, des pages cohérentes et des états accessibles, testés sur de vrais écrans.",
    },
  },
  {
    id: "photoshop", group: "design", name: "Photoshop", status: "practice", where: [], links: [],
    desc: {
      en: "Image editing and preparing visual assets.",
      fr: "Retouche d’images et préparation des visuels.",
    },
  },
  // Tools
  {
    id: "git", group: "tools", name: "Git & GitHub", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["vercel"],
    desc: {
      en: "Branches, pull requests and merge conflicts in a team of four; clear commit messages.",
      fr: "Branches, pull requests et conflits de fusion en équipe de quatre ; messages de commit clairs.",
    },
  },
  {
    id: "vercel", group: "tools", name: "Vercel", status: "practice", where: ["M3AK", "Task Flow"], links: [],
    desc: {
      en: "Deploying static sites and serverless Express apps.",
      fr: "Déploiement de sites statiques et d’applications Express serverless.",
    },
  },
  {
    id: "postman", group: "tools", name: "Postman", status: "practice", where: ["API ParcAuto"], links: ["rest"],
    desc: {
      en: "Testing every route of my APIs — status codes, bodies and error cases.",
      fr: "Tester chaque route de mes API — codes de statut, corps de réponse et cas d’erreur.",
    },
  },
  {
    id: "vscode", group: "tools", name: "VS Code", status: "practice", where: [], links: ["git"],
    desc: {
      en: "My editor, every day.",
      fr: "Mon éditeur, tous les jours.",
    },
  },
];
