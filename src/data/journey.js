// Timeline, oldest first. kind: education | project | experience | learning | next.
// An entry with `experience` (index into src/data/experience.js) shows the full internship card.

export const journey = [
  {
    kind: "education",
    date: { en: "2024", fr: "2024", ar: "2024" },
    title: { en: "Baccalaureate in physical sciences", fr: "Baccalauréat sciences physiques", ar: "البكالوريا، شعبة العلوم الفيزيائية" },
    text: {
      en: "A science track, before I moved to development.",
      fr: "Une filière scientifique, avant de passer au développement.",
      ar: "مسلك علمي قبل الانتقال إلى البرمجة.",
    },
  },
  {
    kind: "education",
    date: { en: "2025", fr: "2025", ar: "2025" },
    title: {
      en: "Full-Stack Development at eWA Digitale",
      fr: "Développement Full-Stack à eWA Digitale",
      ar: "تطوير الويب الشامل في eWA Digitale",
    },
    text: {
      en: "Technicien Spécialisé en Développement Full Stack, Agadir (2025–2027). HTML, CSS, JavaScript, Tailwind CSS, and the Responsive Web Design certification from freeCodeCamp.",
      fr: "Technicien Spécialisé en Développement Full Stack, Agadir (2025–2027). HTML, CSS, JavaScript, Tailwind CSS, et la certification Responsive Web Design de freeCodeCamp.",
      ar: "تقني متخصص في تطوير الويب الشامل، أكادير (2025–2027). HTML وCSS وJavaScript وTailwind CSS، وشهادة Responsive Web Design من freeCodeCamp.",
    },
  },
  {
    kind: "project",
    date: { en: "May – July 2026", fr: "Mai – juillet 2026", ar: "ماي – يوليوز 2026" },
    title: { en: "Academic team projects", fr: "Projets académiques en équipe", ar: "مشاريع أكاديمية جماعية" },
    text: {
      en: "Task Flow and Code Arena with three classmates: Express APIs, authentication, Git branches and pull requests.",
      fr: "Task Flow et Code Arena avec trois camarades : API Express, authentification, branches Git et pull requests.",
      ar: "Task Flow وCode Arena مع ثلاثة من زملائي: واجهات Express API، والمصادقة، وفروع Git وطلبات الدمج.",
    },
  },
  {
    kind: "experience",
    experience: 0,
    date: { en: "July – September 2026", fr: "Juillet – septembre 2026", ar: "يوليوز – شتنبر 2026" },
    title: { en: "Front-end internship at Vala Blue", fr: "Stage front-end chez Vala Blue", ar: "تدريب في الواجهة الأمامية لدى Vala Blue" },
  },
  {
    kind: "project",
    date: { en: "September – October 2026", fr: "Septembre – octobre 2026", ar: "شتنبر – أكتوبر 2026" },
    title: { en: "M3AK Morocco, continued", fr: "M3AK Morocco, la suite", ar: "M3AK Morocco، مواصلة العمل" },
    text: {
      en: "After the internship I kept working on it: French and Arabic with a right-to-left layout, a shared footer on all pages, an accessibility pass.",
      fr: "Après le stage, j’ai continué : français et arabe avec mise en page de droite à gauche, pied de page commun à toutes les pages, passe d’accessibilité.",
      ar: "بعد التدريب واصلت العمل عليه: الفرنسية والعربية مع تخطيط من اليمين إلى اليسار، وتذييل موحّد لكل الصفحات، ومراجعة لسهولة الوصول.",
    },
  },
  {
    kind: "learning",
    current: true,
    date: { en: "Since October 2026", fr: "Depuis octobre 2026", ar: "منذ أكتوبر 2026" },
    title: { en: "Second year: back-end and data", fr: "Deuxième année : back-end et données", ar: "السنة الثانية: الواجهة الخلفية والبيانات" },
    text: {
      en: "SQL, PostgreSQL and database design at eWA, alongside Node.js, Express and REST APIs.",
      fr: "SQL, PostgreSQL et conception de bases de données à eWA, en parallèle de Node.js, Express et des API REST.",
      ar: "SQL وPostgreSQL وتصميم قواعد البيانات في eWA، إلى جانب Node.js وExpress وواجهات REST API.",
    },
    showFocus: true,
  },
  {
    kind: "next",
    date: { en: "April 2027", fr: "Avril 2027", ar: "أبريل 2027" },
    title: { en: "PFE internship", fr: "Stage PFE", ar: "تدريب نهاية الدراسة (PFE)" },
    text: {
      en: "Joining a team for my end-of-studies internship — after building one complete full-stack project on PostgreSQL.",
      fr: "Rejoindre une équipe pour mon stage de fin d’études — après avoir réalisé un projet full-stack complet sur PostgreSQL.",
      ar: "الانضمام إلى فريق لتدريب نهاية الدراسة، بعد إنجاز مشروع Full‑Stack متكامل يعتمد على PostgreSQL.",
    },
  },
];

export const focus = [
  { en: "Node.js and Express", fr: "Node.js et Express", ar: "Node.js وExpress" },
  { en: "PostgreSQL and database design", fr: "PostgreSQL et conception de BDD", ar: "PostgreSQL وتصميم قواعد البيانات" },
  { en: "REST API design", fr: "Conception d’API REST", ar: "تصميم واجهات REST API" },
  { en: "Full-stack architecture", fr: "Architecture full-stack", ar: "بنية تطبيقات Full‑Stack" },
];
