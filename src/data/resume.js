// The CV, as structured data — source: public/cv/Hafid-Karkouch-CV.pdf (French original, version of Nov. 2026:
// "Disponible pour un stage PFE – Mi-mars 2027").
// `fr` is the CV's own wording; `en` and `ar` are faithful translations with nothing added.
// Update this file together with the PDF.

export const cvFile = {
  pdf: "cv/Hafid-Karkouch-CV.pdf",
  downloadName: "Hafid-Karkouch-CV.pdf",
  preview: "cv/Hafid-Karkouch-CV-preview.webp", // page 1 rendered from the PDF (for browsers without a PDF viewer)
  previewSmall: "cv/Hafid-Karkouch-CV-preview-760.webp",
  previewWidth: 1400,
  previewHeight: 1981,
  size: "80 KB",
  language: { en: "French", fr: "français", ar: "بالفرنسية" },
  updated: "2026-11",
};

export const resume = {
  title: {
    en: "Full Stack Development Student",
    fr: "Étudiant en Développement Full Stack",
    ar: "طالب في تطوير الويب الشامل — Full Stack",
  },
  seeking: {
    en: "Available for a PFE internship – mid-March 2027",
    fr: "Disponible pour un stage PFE – Mi-mars 2027",
    ar: "متاح لتدريب نهاية الدراسة (PFE) – منتصف مارس 2027",
  },
  contact: {
    location: { en: "Agadir, Morocco", fr: "Agadir, Maroc", ar: "أكادير، المغرب" },
    email: "hafidkarkouch5@gmail.com",
    phone: "+212 639-675169",
    phoneHref: "tel:+212639675169",
    github: "https://github.com/hfdkr",
    linkedin: "https://www.linkedin.com/in/hafid-k/",
  },
  profile: {
    en: "Second-year Full Stack Development student at eWA Digitale (Agadir), looking for a PFE internship from mid-March 2027. Two months of professional experience in front-end development on M3AK Morocco, a multilingual citizen-services platform, and back-end contributions (Node.js, Express.js, REST APIs, authentication) to academic team projects. Motivated to join a development team, take on assigned tasks and grow on real projects.",
    fr: "Étudiant en deuxième année de Développement Full Stack à eWA Digitale (Agadir), à la recherche d’un stage PFE dès mi-mars 2027. Deux mois d’expérience professionnelle en développement frontend sur M3AK Morocco, une plateforme multilingue de services aux citoyens, et des contributions backend (Node.js, Express.js, API REST, authentification) à des projets académiques en équipe. Motivé pour intégrer une équipe de développement, assumer les tâches confiées et progresser sur des projets concrets.",
    ar: "طالب في السنة الثانية من تكوين تطوير الويب الشامل في eWA Digitale (أكادير)، أبحث عن تدريب نهاية الدراسة ابتداءً من منتصف مارس 2027. لديّ شهران من الخبرة المهنية في تطوير الواجهة الأمامية على M3AK Morocco، وهي منصة متعددة اللغات لخدمات المواطنين، ومساهمات في الواجهة الخلفية (Node.js وExpress.js وواجهات REST والمصادقة) ضمن مشاريع أكاديمية جماعية. متحمس للانضمام إلى فريق تطوير، وتحمّل المهام الموكلة إليّ، والتطور من خلال مشاريع حقيقية.",
  },

  experience: [
    {
      role: { en: "Front-end Developer Intern", fr: "Stagiaire Développeur Frontend", ar: "متدرّب مطوّر واجهات أمامية" },
      company: "Vala Blue / Creative Internet Solutions",
      period: { en: "Jul. 2026 – Sep. 2026", fr: "Juil. 2026 – Sept. 2026", ar: "يوليوز 2026 – شتنبر 2026" },
      place: { en: "Agadir, Morocco (remote)", fr: "Agadir, Maroc (à distance)", ar: "أكادير، المغرب (عن بُعد)" },
      project: "M3AK Morocco",
      links: [
        ["projet-m3-ak.vercel.app", "https://projet-m3-ak.vercel.app/"],
        ["github.com/hfdkr/Projet-M3AK", "https://github.com/hfdkr/Projet-M3AK"],
      ],
      points: {
        en: [
          "Built responsive pages for a citizen-services platform (HTML5, Tailwind CSS v4, vanilla JavaScript).",
          "Pages built: home, services directory, transport, emergencies, user dashboard, authentication.",
          "Set up the trilingual interface (French, Arabic, English), with a right-to-left (RTL) layout for Arabic.",
          "Client-side features: form validation, show-password, light/dark theme, preferences in localStorage.",
          "Code managed with Git and GitHub (feature branches, merges); platform deployed on Vercel.",
        ],
        fr: [
          "Développement de pages responsives d’une plateforme de services aux citoyens (HTML5, Tailwind CSS v4, JavaScript natif).",
          "Pages réalisées : accueil, annuaire des services, transport, urgences, tableau de bord utilisateur, authentification.",
          "Mise en place de l’interface trilingue (français, arabe, anglais), avec mise en page de droite à gauche (RTL) pour l’arabe.",
          "Fonctionnalités côté client : validation de formulaires, affichage du mot de passe, thème clair/sombre, préférences en localStorage.",
          "Gestion du code avec Git et GitHub (branches de fonctionnalités, fusions) ; plateforme déployée sur Vercel.",
        ],
        ar: [
          "تطوير صفحات متجاوبة لمنصة خدمات المواطنين (HTML5 وTailwind CSS v4 وJavaScript خالص).",
          "الصفحات المنجزة: الرئيسية، ودليل الخدمات، والنقل، والطوارئ، ولوحة تحكم المستخدم، والمصادقة.",
          "إعداد واجهة ثلاثية اللغة (الفرنسية والعربية والإنجليزية)، مع تخطيط من اليمين إلى اليسار (RTL) للعربية.",
          "وظائف من جهة المتصفح: التحقق من النماذج، وإظهار كلمة المرور، والوضع الفاتح/الداكن، وحفظ التفضيلات في localStorage.",
          "إدارة الكود بـ Git وGitHub (فروع للميزات وعمليات دمج)؛ والمنصة منشورة على Vercel.",
        ],
      },
    },
  ],

  projects: [
    {
      name: "Task Flow",
      kind: { en: "Academic team project", fr: "Projet académique en équipe", ar: "مشروع أكاديمي جماعي" },
      repo: ["github.com/hfdkr/Task_Flow", "https://github.com/hfdkr/Task_Flow"],
      summary: {
        en: "Task management app: Kanban board, admin/member roles and a statistics dashboard.",
        fr: "Application de gestion de tâches : tableau Kanban, rôles admin/membre et tableau de bord statistique.",
        ar: "تطبيق لإدارة المهام: لوحة Kanban، وأدوار المسؤول/العضو، ولوحة إحصائيات.",
      },
      points: {
        en: [
          "Took part in the Express.js REST API for tasks, projects and team members (CRUD operations).",
          "Took part in session authentication with express-session and bcrypt, including role-based access control.",
          "Took part in the client-side JavaScript features connected to the API.",
        ],
        fr: [
          "Participation à l’API REST Express.js pour les tâches, projets et membres de l’équipe (opérations CRUD).",
          "Participation à l’authentification par session avec express-session et bcrypt, incluant le contrôle d’accès par rôle.",
          "Participation aux fonctionnalités JavaScript côté client connectées à l’API.",
        ],
        ar: [
          "المشاركة في واجهة REST API بـ Express.js للمهام والمشاريع وأعضاء الفريق (عمليات CRUD).",
          "المشاركة في المصادقة بالجلسات عبر express-session وbcrypt، بما فيها التحكم في الوصول حسب الدور.",
          "المشاركة في وظائف JavaScript من جهة المتصفح المرتبطة بالواجهة البرمجية.",
        ],
      },
      stack: ["Node.js", "Express.js", "express-session", "bcrypt", "JavaScript", "Tailwind CSS"],
    },
    {
      name: "CODE ARENA",
      kind: { en: "Academic team project", fr: "Projet académique en équipe", ar: "مشروع أكاديمي جماعي" },
      repo: ["github.com/hfdkr/CODE-ARENA1", "https://github.com/hfdkr/CODE-ARENA1"],
      summary: {
        en: "Learning platform: timed quizzes by category and difficulty, lessons and a leaderboard.",
        fr: "Plateforme d’apprentissage : quiz chronométrés par catégorie et difficulté, leçons et classement.",
        ar: "منصة تعلّم: اختبارات مؤقتة حسب الفئة ومستوى الصعوبة، ودروس، ولوحة ترتيب.",
      },
      points: {
        en: ["Took part in the Express.js REST API and JWT authentication with password hashing via bcrypt.", "Took part in the client-side JavaScript application that consumes the REST API."],
        fr: ["Participation à l’API REST Express.js et à l’authentification JWT avec hachage des mots de passe via bcrypt.", "Participation à l’application JavaScript côté client qui consomme l’API REST."],
        ar: ["المشاركة في واجهة REST API بـ Express.js وفي مصادقة JWT مع تجزئة كلمات المرور عبر bcrypt.", "المشاركة في تطبيق JavaScript من جهة المتصفح الذي يستهلك واجهة REST."],
      },
      stack: ["Node.js", "Express.js", "JWT", "bcrypt", "JavaScript", "HTML5", "CSS3", "JSON files"],
    },
    {
      name: "STRYDE E-commerce",
      kind: { en: "Front-end project", fr: "Projet frontend", ar: "مشروع واجهة أمامية" },
      repo: ["github.com/hfdkr/Ecommerce-project", "https://github.com/hfdkr/Ecommerce-project"],
      summary: null,
      points: {
        en: ["Responsive layout of a cart page (products, order summary, payment) with Tailwind CSS.", "Light/dark theme toggle in JavaScript, with the user’s preference saved in localStorage."],
        fr: ["Mise en page responsive d’une page panier (produits, récapitulatif de commande, paiement) avec Tailwind CSS.", "Bascule thème clair/sombre en JavaScript, avec préférence de l’utilisateur enregistrée en localStorage."],
        ar: ["تخطيط متجاوب لصفحة سلة التسوق (المنتجات، وملخّص الطلب، والدفع) بـ Tailwind CSS.", "تبديل بين الوضع الفاتح والداكن بـ JavaScript، مع حفظ تفضيل المستخدم في localStorage."],
      },
      stack: ["HTML5", "Tailwind CSS", "JavaScript"],
    },
  ],

  skills: [
    {
      label: { en: "Front-end", fr: "Frontend", ar: "الواجهة الأمامية" },
      items: "HTML5, CSS3, JavaScript, Tailwind CSS, Bootstrap, Responsive Web Design",
      note: { en: "learning React.js", fr: "apprentissage de React.js en cours", ar: "أتعلّم React.js حالياً" },
    },
    {
      label: { en: "Back-end", fr: "Backend", ar: "الواجهة الخلفية" },
      items: { en: "Node.js, Express.js, REST APIs, CRUD operations, session and JWT authentication", fr: "Node.js, Express.js, API REST, opérations CRUD, authentification par session et JWT", ar: "Node.js، Express.js، واجهات REST، عمليات CRUD، المصادقة بالجلسات وJWT" },
      note: { en: "academic team projects", fr: "projets académiques en équipe", ar: "مشاريع أكاديمية جماعية" },
    },
    {
      label: { en: "Databases & modelling", fr: "Bases de données & modélisation", ar: "قواعد البيانات والنمذجة" },
      items: { en: "SQL, PostgreSQL, database design, UML", fr: "SQL, PostgreSQL, conception de bases de données, UML", ar: "SQL، PostgreSQL، تصميم قواعد البيانات، UML" },
      note: { en: "in training", fr: "formation en cours", ar: "قيد التكوين" },
    },
    {
      label: { en: "Tools & design", fr: "Outils & design", ar: "الأدوات والتصميم" },
      items: "Git, GitHub, Figma, Adobe Photoshop",
      note: null,
    },
  ],

  education: [
    {
      title: { en: "Specialised Technician in Full Stack Development", fr: "Technicien Spécialisé en Développement Full Stack", ar: "تقني متخصص في تطوير الويب الشامل" },
      school: "eWA Digitale",
      detail: {
        en: "Agadir, Morocco · Currently in second year · Expected diploma: 2027",
        fr: "Agadir, Maroc · Actuellement en deuxième année · Diplôme prévu : 2027",
        ar: "أكادير، المغرب · حالياً في السنة الثانية · الدبلوم المتوقع: 2027",
      },
      years: "2025 – 2027",
    },
    {
      title: { en: "Baccalaureate in Physical Sciences", fr: "Baccalauréat en Sciences Physiques", ar: "البكالوريا، شعبة العلوم الفيزيائية" },
      school: { en: "Lycée Sidi Hsain", fr: "Lycée Sidi Hsain", ar: "ثانوية سيدي حساين" },
      detail: { en: "Lakhsas, Sidi Ifni Province, Morocco", fr: "Lakhsas, Province de Sidi Ifni, Maroc", ar: "الأخصاص، إقليم سيدي إفني، المغرب" },
      years: "2024",
    },
  ],

  certification: {
    title: { en: "Responsive Web Design Certification – freeCodeCamp", fr: "Certification Responsive Web Design – freeCodeCamp", ar: "شهادة Responsive Web Design – freeCodeCamp" },
    link: ["freecodecamp.org/certification/hafid_karkouch", "https://www.freecodecamp.org/certification/hafid_karkouch/responsive-web-design"],
  },

  // level: 4 native · 3 fluent · 2 intermediate (as written in the CV)
  languages: [
    { name: { en: "Amazigh", fr: "Amazigh", ar: "الأمازيغية" }, level: 4 },
    { name: { en: "Arabic", fr: "Arabe", ar: "العربية" }, level: 3 },
    { name: { en: "French", fr: "Français", ar: "الفرنسية" }, level: 2 },
    { name: { en: "English", fr: "Anglais", ar: "الإنجليزية" }, level: 2 },
  ],
};
