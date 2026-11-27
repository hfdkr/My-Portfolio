// Skills universe. status: "practice" (used in real work) | "learning" (studying it now).
// where: evidence, as project names. links: other skill ids drawn as connections in 3D.

export const skillGroups = [
  { id: "frontend", colorLight: "#4a3dd0", color: "#8b7dff", title: { en: "Front-end", fr: "Front-end", ar: "الواجهة الأمامية" } },
  { id: "backend", colorLight: "#0a7c9c", color: "#52e0ff", title: { en: "Back-end", fr: "Back-end", ar: "الواجهة الخلفية" } },
  { id: "database", colorLight: "#8f5e00", color: "#ffb547", title: { en: "Database", fr: "Bases de données", ar: "قواعد البيانات" } },
  { id: "design", colorLight: "#b0306f", color: "#ff7ac6", title: { en: "Design", fr: "Design", ar: "التصميم" } },
  { id: "tools", colorLight: "#3f7d1f", color: "#9be27a", title: { en: "Tools", fr: "Outils", ar: "الأدوات" } },
];

const eWA = { en: "eWA, 2nd year", fr: "eWA, 2e année", ar: "eWA، السنة الثانية" };

export const skills = [
  // Front-end
  {
    id: "html", group: "frontend", name: "HTML5", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["css", "js"],
    desc: {
      en: "Semantic structure, forms and accessible markup — the base of every page I build.",
      fr: "Structure sémantique, formulaires et balisage accessible — la base de chaque page que je construis.",
      ar: "بنية دلالية ونماذج وترميز سهل الوصول، أساس كل صفحة أبنيها.",
    },
  },
  {
    id: "css", group: "frontend", name: "CSS3", status: "practice", where: ["M3AK", "Code Arena"], links: ["tailwind"],
    desc: {
      en: "Layout with flexbox and grid, custom properties for theming, responsive rules.",
      fr: "Mise en page avec flexbox et grid, variables CSS pour les thèmes, règles responsives.",
      ar: "التخطيط بـ flexbox وgrid، ومتغيّرات CSS للألوان، وقواعد التجاوب.",
    },
  },
  {
    id: "js", group: "frontend", name: "JavaScript", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["node"],
    desc: {
      en: "DOM, events, fetch, localStorage and small modules — vanilla, no framework needed.",
      fr: "DOM, événements, fetch, localStorage et petits modules — en natif, sans framework.",
      ar: "DOM والأحداث وfetch وlocalStorage ووحدات صغيرة، بلغة JavaScript خالصة دون إطار عمل.",
    },
  },
  {
    id: "tailwind", group: "frontend", name: "Tailwind CSS", status: "practice", where: ["M3AK", "Task Flow"], links: ["figma"],
    desc: {
      en: "My daily styling tool, including v4 design tokens, dark mode and RTL variants.",
      fr: "Mon outil de style au quotidien, y compris les tokens de la v4, le mode sombre et les variantes RTL.",
      ar: "أداة التنسيق اليومية، بما فيها متغيّرات التصميم في الإصدار 4 والوضع الداكن ومتغيّرات RTL.",
    },
  },
  {
    id: "responsive", group: "frontend", name: { en: "Responsive UI", fr: "Interfaces responsives", ar: "واجهات متجاوبة" }, status: "practice", where: ["M3AK"], links: ["css"],
    desc: {
      en: "Desktop and mobile mockups turned into pages that hold up on every screen.",
      fr: "Des maquettes desktop et mobile transformées en pages qui tiennent sur tous les écrans.",
      ar: "تحويل تصاميم الحاسوب والهاتف إلى صفحات تعمل جيداً على كل الشاشات.",
    },
  },
  {
    id: "i18n", group: "frontend", name: { en: "i18n & RTL", fr: "i18n et RTL", ar: "تعدد اللغات وRTL" }, status: "practice", where: ["M3AK"], links: ["js"],
    desc: {
      en: "English, French and Arabic interfaces, with a full right-to-left layout.",
      fr: "Interfaces en anglais, français et arabe, avec mise en page complète de droite à gauche.",
      ar: "واجهات بالإنجليزية والفرنسية والعربية، مع تخطيط كامل من اليمين إلى اليسار.",
    },
  },
  {
    id: "react", group: "frontend", name: "React", status: "learning", where: [], links: ["js"],
    desc: {
      en: "Components, props and state — the next step after vanilla JavaScript, learning it now.",
      fr: "Composants, props et état — l’étape après le JavaScript natif, en cours d’apprentissage.",
      ar: "المكوّنات والخصائص والحالة — الخطوة التالية بعد JavaScript الخالص، أتعلّمها الآن.",
    },
  },
  // Back-end
  {
    id: "node", group: "backend", name: "Node.js", status: "learning", where: ["Task Flow", "Code Arena"], links: ["express"],
    desc: {
      en: "Running JavaScript on the server: modules, file system, async code.",
      fr: "JavaScript côté serveur : modules, système de fichiers, code asynchrone.",
      ar: "تشغيل JavaScript على الخادم: الوحدات، ونظام الملفات، والبرمجة غير المتزامنة.",
    },
  },
  {
    id: "express", group: "backend", name: "Express.js", status: "learning", where: ["Task Flow", "Code Arena", "API ParcAuto"], links: ["rest", "auth"],
    desc: {
      en: "Routes, middleware and error handling, split into files that stay readable.",
      fr: "Routes, middlewares et gestion des erreurs, découpés en fichiers qui restent lisibles.",
      ar: "المسارات والوسائط ومعالجة الأخطاء، موزّعة على ملفات تبقى مقروءة.",
    },
  },
  {
    id: "rest", group: "backend", name: { en: "REST APIs", fr: "API REST", ar: "واجهات REST" }, status: "learning", where: ["Task Flow", "Code Arena", "API ParcAuto"], links: ["sql"],
    desc: {
      en: "CRUD endpoints consumed by a vanilla front-end: resources, status codes, validation.",
      fr: "Endpoints CRUD consommés par un front-end natif : ressources, codes de statut, validation.",
      ar: "نقاط CRUD تستهلكها واجهة أمامية خالصة: الموارد، ورموز الحالة، والتحقق.",
    },
  },
  {
    id: "auth", group: "backend", name: { en: "Auth: sessions, JWT", fr: "Auth : sessions, JWT", ar: "المصادقة: جلسات وJWT" }, status: "learning", where: ["Task Flow", "Code Arena"], links: [],
    desc: {
      en: "Session cookies and JWT, bcrypt hashing, rate-limited login, one-time reset links.",
      fr: "Cookies de session et JWT, hachage bcrypt, connexion limitée, liens de réinitialisation à usage unique.",
      ar: "ملفات الجلسة وJWT، وتجزئة bcrypt، وتحديد محاولات الدخول، وروابط استرجاع لاستعمال واحد.",
    },
  },
  // Database
  {
    id: "sql", group: "database", name: "SQL", status: "learning", where: [eWA], links: ["postgres"],
    desc: {
      en: "Queries, joins and constraints, studied this year at eWA Digitale.",
      fr: "Requêtes, jointures et contraintes, étudiées cette année à eWA Digitale.",
      ar: "الاستعلامات وعمليات الربط والقيود، أدرسها هذه السنة في eWA Digitale.",
    },
  },
  {
    id: "postgres", group: "database", name: "PostgreSQL", status: "learning", where: [eWA], links: ["dbdesign"],
    desc: {
      en: "The database I’m learning now — next step: use it in a complete project.",
      fr: "La base de données que j’apprends en ce moment — prochaine étape : l’utiliser dans un projet complet.",
      ar: "قاعدة البيانات التي أتعلّمها الآن، والخطوة التالية: استعمالها في مشروع متكامل.",
    },
  },
  {
    id: "dbdesign", group: "database", name: { en: "DB design & UML", fr: "Conception BDD et UML", ar: "تصميم القواعد وUML" }, status: "learning", where: [eWA], links: [],
    desc: {
      en: "Modelling entities and relations with UML before turning them into tables.",
      fr: "Modéliser entités et relations en UML avant de les traduire en tables.",
      ar: "نمذجة الكيانات والعلاقات بـ UML قبل تحويلها إلى جداول.",
    },
  },
  // Design
  {
    id: "figma", group: "design", name: "Figma", status: "practice", where: ["M3AK"], links: ["uiux"],
    desc: {
      en: "Where my interfaces start: layouts, components and both themes before code.",
      fr: "Là où mes interfaces commencent : mises en page, composants et deux thèmes avant le code.",
      ar: "حيث تبدأ واجهاتي: التخطيط والمكوّنات والوضعان قبل الكود.",
    },
  },
  {
    id: "uiux", group: "design", name: { en: "UI/UX design", fr: "Design UI/UX", ar: "تصميم UI/UX" }, status: "practice", where: ["M3AK"], links: ["responsive"],
    desc: {
      en: "Clear journeys, consistent pages and accessible states, tested on real screens.",
      fr: "Des parcours clairs, des pages cohérentes et des états accessibles, testés sur de vrais écrans.",
      ar: "مسارات واضحة وصفحات متناسقة وحالات سهلة الوصول، مجرّبة على شاشات حقيقية.",
    },
  },
  {
    id: "photoshop", group: "design", name: "Photoshop", status: "practice", where: [], links: [],
    desc: {
      en: "Image editing and preparing visual assets.",
      fr: "Retouche d’images et préparation des visuels.",
      ar: "تعديل الصور وتجهيز العناصر البصرية.",
    },
  },
  // Tools
  {
    id: "git", group: "tools", name: "Git & GitHub", status: "practice", where: ["M3AK", "Task Flow", "Code Arena"], links: ["vercel"],
    desc: {
      en: "Branches, pull requests and merge conflicts in a team of four; clear commit messages.",
      fr: "Branches, pull requests et conflits de fusion en équipe de quatre ; messages de commit clairs.",
      ar: "الفروع وطلبات الدمج وحلّ التعارضات ضمن فريق من أربعة، ورسائل commit واضحة.",
    },
  },
  {
    id: "vercel", group: "tools", name: "Vercel", status: "practice", where: ["M3AK", "Task Flow"], links: [],
    desc: {
      en: "Deploying static sites and serverless Express apps.",
      fr: "Déploiement de sites statiques et d’applications Express serverless.",
      ar: "نشر المواقع الثابتة وتطبيقات Express السحابية.",
    },
  },
  {
    id: "postman", group: "tools", name: "Postman", status: "practice", where: ["API ParcAuto"], links: ["rest"],
    desc: {
      en: "Testing every route of my APIs — status codes, bodies and error cases.",
      fr: "Tester chaque route de mes API — codes de statut, corps de réponse et cas d’erreur.",
      ar: "اختبار كل مسارات واجهاتي البرمجية: رموز الحالة، ومحتوى الردود، وحالات الخطأ.",
    },
  },
  {
    id: "vscode", group: "tools", name: "VS Code", status: "practice", where: [], links: ["git"],
    desc: {
      en: "My editor, every day.",
      fr: "Mon éditeur, tous les jours.",
      ar: "محرّري اليومي.",
    },
  },
];
