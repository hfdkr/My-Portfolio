// Selected projects. `id` is also the name used by the terminal (open m3ak).
// To add one, copy an object, put screenshots in /public/projects
// as <name>-1600.webp and <name>-800.webp (16:10), and fill every field in en / fr / ar.
// Only describe what can be checked in the repository.

export const projects = [
  {
    id: "m3ak",
    name: "M3AK Morocco",
    year: "2026",
    // Visual identity of the project in the showcase (taken from the project's own UI).
    color: "#1fd18b",
    colorLight: "#0a7a4f", // darker variant for text on the light theme
    context: {
      en: "Internship project, front-end",
      fr: "Projet de stage, front-end",
      ar: "مشروع التدريب، واجهة أمامية",
    },
    summary: {
      en: "A concept platform that gathers Moroccan public services in one place: a personal citizen space, a services directory, transport, payments and an emergency hub.",
      fr: "Une plateforme concept qui réunit les services publics marocains en un seul endroit : un espace citoyen personnel, un annuaire des services, le transport, les paiements et un centre d’urgence.",
      ar: "منصة نموذجية تجمع الخدمات العمومية المغربية في مكان واحد: فضاء شخصي للمواطن، ودليل للخدمات، والنقل، والأداءات، ومركز للطوارئ.",
    },
    myPart: {
      en: "I designed the interfaces in Figma and built the whole front-end: every page, the shared layout and the small JavaScript modules behind it. The work started during my internship and I kept improving it afterwards.",
      fr: "J’ai conçu les interfaces sur Figma et développé tout le front-end : chaque page, la mise en page commune et les petits modules JavaScript qui la font fonctionner. Le travail a commencé pendant mon stage et je l’ai poursuivi ensuite.",
      ar: "صمّمت الواجهات على Figma وبنيت الواجهة الأمامية كاملة: كل الصفحات، والتخطيط المشترك، ووحدات JavaScript الصغيرة التي تشغّله. بدأ العمل خلال التدريب وواصلت تطويره بعده.",
    },
    role: {
      en: "UI/UX design and front-end — internship",
      fr: "Design UI/UX et front-end — stage",
      ar: "تصميم UI/UX والواجهة الأمامية — تدريب",
    },
    challenge: {
      en: "Twenty-two pages, three languages, two themes — and no framework to keep them consistent.",
      fr: "Vingt-deux pages, trois langues, deux thèmes — et aucun framework pour garder l’ensemble cohérent.",
      ar: "اثنتان وعشرون صفحة، وثلاث لغات، ووضعان للألوان، ولا إطار عمل يضمن التناسق بينها.",
    },
    approach: {
      en: "I designed every screen in Figma first, then split the shared behaviour into small vanilla JavaScript modules — session, theme, translations, layout shell — that every page loads.",
      fr: "J’ai d’abord conçu chaque écran sur Figma, puis découpé le comportement commun en petits modules JavaScript natifs — session, thème, traductions, structure de page — chargés par chaque page.",
      ar: "صمّمت كل شاشة على Figma أولاً، ثم قسّمت السلوك المشترك إلى وحدات JavaScript صغيرة — الجلسة، والألوان، والترجمة، وهيكل الصفحة — تحمّلها كل صفحة.",
    },
    learned: {
      en: [
        "Turning desktop and mobile mockups into responsive pages",
        "Adding a dark mode to a project that already had many pages",
        "Splitting shared JavaScript into small, reusable modules",
      ],
      fr: [
        "Transformer des maquettes desktop et mobile en pages responsives",
        "Ajouter un mode sombre à un projet qui comptait déjà de nombreuses pages",
        "Découper le JavaScript commun en petits modules réutilisables",
      ],
      ar: [
        "تحويل تصاميم الحاسوب والهاتف إلى صفحات متجاوبة",
        "إضافة الوضع الداكن إلى مشروع يضم صفحات كثيرة أصلاً",
        "تقسيم كود JavaScript المشترك إلى وحدات صغيرة قابلة لإعادة الاستخدام",
      ],
    },
    features: {
      en: [
        "22 pages sharing one sidebar, header, footer and theme system",
        "Emergency hub with a press-and-hold SOS button, quick-dial numbers and a live map",
        "English, French and Arabic, with a full right-to-left layout",
        "Light and dark themes, remembered across pages and tabs",
        "Client-side session, auth guard and form validation with accessible error messages",
      ],
      fr: [
        "22 pages qui partagent la même barre latérale, le même en-tête, le même pied de page et le même système de thèmes",
        "Centre d’urgence avec bouton SOS à maintenir appuyé, appels rapides et carte en direct",
        "Anglais, français et arabe, avec une mise en page complète de droite à gauche",
        "Thèmes clair et sombre, mémorisés d’une page et d’un onglet à l’autre",
        "Session côté client, protection des pages et validation des formulaires avec messages d’erreur accessibles",
      ],
      ar: [
        "22 صفحة تتشارك الشريط الجانبي والترويسة والتذييل ونظام الألوان نفسه",
        "مركز طوارئ بزر استغاثة SOS يُضغط باستمرار، وأرقام اتصال سريع، وخريطة مباشرة",
        "الإنجليزية والفرنسية والعربية، مع تخطيط كامل من اليمين إلى اليسار",
        "وضعان فاتح وداكن، يُحفظ الاختيار بين الصفحات وعلامات التبويب",
        "جلسة من جهة المتصفح، وحماية للصفحات، والتحقق من النماذج مع رسائل خطأ سهلة الوصول",
      ],
    },
    detail: {
      en: "No framework: shared behaviour lives in small vanilla JavaScript modules (session, theme, i18n, layout shell) that every page loads. Data is demo data — the back-end is planned for a later phase.",
      fr: "Sans framework : le comportement commun vit dans de petits modules JavaScript natifs (session, thème, i18n, structure de page) chargés par chaque page. Les données sont fictives — le back-end est prévu pour une phase ultérieure.",
      ar: "بدون إطار عمل: السلوك المشترك موزّع على وحدات JavaScript صغيرة (الجلسة، الألوان، الترجمة، هيكل الصفحة) تحمّلها كل صفحة. البيانات تجريبية، والواجهة الخلفية مخطّط لها في مرحلة لاحقة.",
    },
    stack: ["HTML5", "Tailwind CSS v4", "JavaScript", "Leaflet", "Google Maps API", "Figma", "Vercel"],
    repo: "https://github.com/hfdkr/Projet-M3AK",
    live: "https://projet-m3-ak.vercel.app/",
    screens: [
      {
        src: "m3ak-services",
        width: 1440,
        label: { en: "Services, dark", fr: "Services, sombre", ar: "الخدمات، داكن" },
        alt: {
          en: "M3AK services page in dark mode: headline “Your gateway to digital Morocco” next to an illustrated Moroccan building.",
          fr: "Page services de M3AK en mode sombre : titre « Your gateway to digital Morocco » à côté d’une illustration de bâtiment marocain.",
          ar: "صفحة الخدمات في M3AK بالوضع الداكن: عنوان «Your gateway to digital Morocco» بجانب رسم لمبنى مغربي.",
        },
      },
      {
        src: "m3ak-myspace",
        width: 1440,
        label: { en: "My Space", fr: "Mon espace", ar: "فضائي" },
        alt: {
          en: "M3AK “My Space” dashboard with request, payment and appointment counters, live transport status and a weekly activity chart.",
          fr: "Tableau de bord « My Space » de M3AK : compteurs de demandes, paiements et rendez-vous, état du transport en direct et graphique d’activité.",
          ar: "لوحة «فضائي» في M3AK: عدّادات الطلبات والأداءات والمواعيد، وحالة النقل المباشرة، ومخطط النشاط الأسبوعي.",
        },
      },
      {
        src: "m3ak-rtl",
        width: 1440,
        label: { en: "Arabic, right-to-left", fr: "Arabe, de droite à gauche", ar: "العربية، من اليمين" },
        alt: {
          en: "The same dashboard in Arabic, with the whole layout mirrored right to left.",
          fr: "Le même tableau de bord en arabe, avec toute la mise en page inversée de droite à gauche.",
          ar: "اللوحة نفسها بالعربية، مع انعكاس التخطيط كاملاً من اليمين إلى اليسار.",
        },
      },
      {
        src: "m3ak-emergency",
        width: 1152,
        label: { en: "Emergency hub", fr: "Centre d’urgence", ar: "مركز الطوارئ" },
        alt: {
          en: "M3AK emergency hub with a large red SOS button and quick-dial cards for police, ambulance, gendarmerie and firefighters.",
          fr: "Centre d’urgence de M3AK avec un grand bouton SOS rouge et des cartes d’appel rapide : police, ambulance, gendarmerie, pompiers.",
          ar: "مركز الطوارئ في M3AK بزر SOS أحمر كبير وبطاقات اتصال سريع بالشرطة والإسعاف والدرك والوقاية المدنية.",
        },
      },
    ],
  },

  {
    id: "taskflow",
    name: "Task Flow",
    year: "2026",
    color: "#6d8bff",
    colorLight: "#3148c9",
    context: {
      en: "School team project of four, full-stack",
      fr: "Projet d’école en équipe de quatre, full-stack",
      ar: "مشروع مدرسي ضمن فريق من أربعة، Full‑Stack",
    },
    summary: {
      en: "A task manager for small teams: a Kanban board, projects, members, roles and an analytics dashboard.",
      fr: "Un gestionnaire de tâches pour petites équipes : tableau Kanban, projets, membres, rôles et tableau de bord analytique.",
      ar: "تطبيق لإدارة المهام للفرق الصغيرة: لوحة Kanban، ومشاريع، وأعضاء، وأدوار، ولوحة إحصائيات.",
    },
    myPart: {
      en: "Mostly back-end. I restructured the Express app into routes, middleware and a storage layer, moved data and sessions to Redis so it runs on Vercel’s serverless functions, added password reset by email and wrote the first test suite. On the front-end I built the Chart.js dashboard and Kanban column reordering.",
      fr: "Surtout le back-end. J’ai restructuré l’application Express en routes, middlewares et couche de stockage, déplacé les données et les sessions vers Redis pour qu’elle tourne sur les fonctions serverless de Vercel, ajouté la réinitialisation du mot de passe par e-mail et écrit la première suite de tests. Côté front-end, j’ai réalisé le tableau de bord Chart.js et le réordonnancement des colonnes Kanban.",
      ar: "أغلب عملي في الواجهة الخلفية: أعدت هيكلة تطبيق Express إلى مسارات ووسائط (middleware) وطبقة تخزين، ونقلت البيانات والجلسات إلى Redis ليعمل التطبيق على الدوال السحابية في Vercel، وأضفت استرجاع كلمة المرور عبر البريد الإلكتروني، وكتبت أول مجموعة اختبارات. وفي الواجهة الأمامية أنجزت لوحة الإحصائيات بـ Chart.js وإعادة ترتيب أعمدة Kanban.",
    },
    role: {
      en: "Back-end, plus the dashboard — team of four",
      fr: "Back-end, plus le tableau de bord — équipe de quatre",
      ar: "الواجهة الخلفية ولوحة الإحصائيات — فريق من أربعة",
    },
    challenge: {
      en: "An Express app with sessions had to run on Vercel’s serverless functions, where nothing is kept between two requests.",
      fr: "Une application Express avec sessions devait tourner sur les fonctions serverless de Vercel, où rien n’est conservé entre deux requêtes.",
      ar: "كان على تطبيق Express يعتمد على الجلسات أن يعمل على الدوال السحابية في Vercel، حيث لا يُحفظ شيء بين طلبين.",
    },
    approach: {
      en: "I restructured the app into routes, middleware and a storage layer, then moved data and sessions to Redis (Upstash) behind that layer.",
      fr: "J’ai restructuré l’application en routes, middlewares et couche de stockage, puis déplacé les données et les sessions vers Redis (Upstash) derrière cette couche.",
      ar: "أعدت هيكلة التطبيق إلى مسارات ووسائط وطبقة تخزين، ثم نقلت البيانات والجلسات إلى Redis (Upstash) خلف هذه الطبقة.",
    },
    learned: {
      en: [
        "Splitting an Express app into routes, middleware and a storage layer",
        "Making an app work on serverless hosting",
        "Git branches, pull requests and merge conflicts in a team of four",
      ],
      fr: [
        "Découper une application Express en routes, middlewares et couche de stockage",
        "Faire fonctionner une application sur un hébergement serverless",
        "Branches Git, pull requests et conflits de fusion en équipe de quatre",
      ],
      ar: [
        "تقسيم تطبيق Express إلى مسارات ووسائط وطبقة تخزين",
        "تشغيل تطبيق على استضافة سحابية بلا خادم دائم (serverless)",
        "فروع Git وطلبات الدمج وحلّ التعارضات ضمن فريق من أربعة",
      ],
    },
    features: {
      en: [
        "Session authentication with bcrypt and rate-limited login",
        "Kanban board with drag and drop, plus a list view",
        "Roles: admins manage tasks, members and projects; members read",
        "Password reset links that expire after 30 minutes and work once",
        "Dashboard: completion rate, priority mix, member load, overdue tasks",
      ],
      fr: [
        "Authentification par session avec bcrypt et limitation des tentatives de connexion",
        "Tableau Kanban avec glisser-déposer, et vue en liste",
        "Rôles : les admins gèrent tâches, membres et projets ; les membres consultent",
        "Liens de réinitialisation valables 30 minutes et utilisables une seule fois",
        "Tableau de bord : taux d’achèvement, priorités, charge par membre, tâches en retard",
      ],
      ar: [
        "مصادقة بالجلسات مع bcrypt وتحديد عدد محاولات تسجيل الدخول",
        "لوحة Kanban بالسحب والإفلات، مع عرض على شكل قائمة",
        "أدوار: المسؤولون يديرون المهام والأعضاء والمشاريع، والأعضاء يطّلعون فقط",
        "روابط استرجاع كلمة المرور صالحة 30 دقيقة ولاستعمال واحد",
        "لوحة إحصائيات: نسبة الإنجاز، توزيع الأولويات، عبء كل عضو، المهام المتأخرة",
      ],
    },
    detail: {
      en: "Reset tokens are stored only as SHA-256 hashes and travel in the URL fragment, so they never reach server logs. Tests run with node:test and supertest against a throwaway data folder.",
      fr: "Les jetons de réinitialisation sont stockés uniquement sous forme de hachage SHA-256 et passent dans le fragment de l’URL : ils n’arrivent jamais dans les journaux du serveur. Les tests tournent avec node:test et supertest sur un dossier de données temporaire.",
      ar: "رموز استرجاع كلمة المرور تُخزَّن فقط كبصمة SHA-256 وتُمرَّر في جزء الرابط بعد العلامة #، فلا تصل أبداً إلى سجلات الخادم. وتعمل الاختبارات بـ node:test وsupertest على مجلد بيانات مؤقت.",
    },
    stack: ["Node.js", "Express 5", "express-session", "bcrypt", "Redis (Upstash)", "Chart.js", "Tailwind CSS", "JavaScript", "node:test"],
    repo: "https://github.com/hfdkr/Task_Flow",
    live: "https://task-flow-two-black.vercel.app/",
    screens: [
      {
        src: "taskflow-board",
        width: 1600,
        label: { en: "Kanban board", fr: "Tableau Kanban", ar: "لوحة Kanban" },
        alt: {
          en: "Task Flow Kanban board with To do, In progress and Done columns, priority badges and due dates.",
          fr: "Tableau Kanban de Task Flow avec les colonnes À faire, En cours et Terminé, badges de priorité et échéances.",
          ar: "لوحة Kanban في Task Flow بأعمدة «للإنجاز» و«قيد التنفيذ» و«منجز»، مع شارات الأولوية والآجال.",
        },
      },
      {
        src: "taskflow-dashboard",
        width: 1600,
        label: { en: "Dashboard", fr: "Tableau de bord", ar: "لوحة الإحصائيات" },
        alt: {
          en: "Task Flow dashboard with task counters, an 84% completion ring, a priority chart, member load and overdue tasks.",
          fr: "Tableau de bord de Task Flow : compteurs de tâches, anneau d’achèvement à 84 %, graphique des priorités, charge des membres et tâches en retard.",
          ar: "لوحة إحصائيات Task Flow: عدّادات المهام، ودائرة إنجاز بنسبة 84٪، ومخطط الأولويات، وعبء الأعضاء، والمهام المتأخرة.",
        },
      },
    ],
  },

  {
    id: "codearena",
    name: "Code Arena",
    year: "2026",
    color: "#ff8a4c",
    colorLight: "#b4470f",
    context: {
      en: "School team project of four, full-stack",
      fr: "Projet d’école en équipe de quatre, full-stack",
      ar: "مشروع مدرسي ضمن فريق من أربعة، Full‑Stack",
    },
    summary: {
      en: "A quiz platform for web development: pick a category and a difficulty, answer against the clock, and see where you land on the leaderboard.",
      fr: "Une plateforme de quiz sur le développement web : choisir une catégorie et une difficulté, répondre contre la montre et voir sa place au classement.",
      ar: "منصة اختبارات في تطوير الويب: اختر الفئة ومستوى الصعوبة، أجب قبل انتهاء الوقت، واكتشف ترتيبك في لوحة المتصدّرين.",
    },
    myPart: {
      en: "I wrote the question bank for HTML, CSS, JavaScript and Python across difficulty levels, the JSON database read/write helpers, the online-users tracking and the forgot-password flow.",
      fr: "J’ai écrit la banque de questions HTML, CSS, JavaScript et Python sur plusieurs niveaux de difficulté, les fonctions de lecture/écriture de la base JSON, le suivi des utilisateurs en ligne et le parcours « mot de passe oublié ».",
      ar: "كتبت بنك الأسئلة في HTML وCSS وJavaScript وPython بمستويات صعوبة مختلفة، ودوال القراءة والكتابة في قاعدة بيانات JSON، وتتبّع المستخدمين المتصلين، ومسار «نسيت كلمة المرور».",
    },
    role: {
      en: "Question bank, data layer and account flows — team of four",
      fr: "Banque de questions, couche de données et parcours de compte — équipe de quatre",
      ar: "بنك الأسئلة وطبقة البيانات ومسارات الحساب — فريق من أربعة",
    },
    challenge: {
      en: "Users, scores, lessons and questions had to be stored and served without a database server.",
      fr: "Utilisateurs, scores, leçons et questions devaient être stockés et servis sans serveur de base de données.",
      ar: "كان لا بد من حفظ المستخدمين والنتائج والدروس والأسئلة وتقديمها من دون خادم قاعدة بيانات.",
    },
    approach: {
      en: "A JSON file behind small read/write helpers, exposed through a REST API in Express that the vanilla JavaScript front-end consumes.",
      fr: "Un fichier JSON derrière de petites fonctions de lecture/écriture, exposé par une API REST Express que consomme le front-end en JavaScript natif.",
      ar: "ملف JSON خلف دوال صغيرة للقراءة والكتابة، تعرضه واجهة REST API بـ Express تستهلكها الواجهة الأمامية المكتوبة بـ JavaScript خالص.",
    },
    learned: {
      en: [
        "Designing REST endpoints that a front-end consumes",
        "Hashing passwords with bcrypt and issuing JWTs",
        "Git branches, pull requests and merge conflicts in a team of four",
      ],
      fr: [
        "Concevoir des endpoints REST consommés par un front-end",
        "Hacher les mots de passe avec bcrypt et émettre des JWT",
        "Branches Git, pull requests et conflits de fusion en équipe de quatre",
      ],
      ar: [
        "تصميم نقاط REST تستهلكها واجهة أمامية",
        "تجزئة كلمات المرور بـ bcrypt وإصدار رموز JWT",
        "فروع Git وطلبات الدمج وحلّ التعارضات ضمن فريق من أربعة",
      ],
    },
    features: {
      en: [
        "JWT authentication with bcrypt-hashed passwords",
        "Four categories, difficulty levels, a normal mode and a 15-second challenge mode",
        "Live score and a global leaderboard",
        "Lessons section and an admin panel to manage questions, lessons and users",
      ],
      fr: [
        "Authentification JWT avec mots de passe hachés par bcrypt",
        "Quatre catégories, niveaux de difficulté, mode normal et mode défi à 15 secondes",
        "Score en direct et classement général",
        "Section leçons et panneau d’administration pour gérer questions, leçons et utilisateurs",
      ],
      ar: [
        "مصادقة JWT مع كلمات مرور مُجزّأة بـ bcrypt",
        "أربع فئات، ومستويات صعوبة، ووضع عادي ووضع تحدٍّ بـ 15 ثانية لكل سؤال",
        "نتيجة مباشرة ولوحة متصدّرين عامة",
        "قسم للدروس ولوحة إدارة للأسئلة والدروس والمستخدمين",
      ],
    },
    detail: {
      en: "A REST API in Express (auth, quiz, scores, lessons, presence heartbeat) consumed by a vanilla JavaScript single-page front-end, with data kept in a JSON file.",
      fr: "Une API REST en Express (authentification, quiz, scores, leçons, signal de présence) consommée par un front-end monopage en JavaScript natif, avec des données stockées dans un fichier JSON.",
      ar: "واجهة REST API مبنية بـ Express (المصادقة، الاختبارات، النتائج، الدروس، إشارة الحضور) تستهلكها واجهة أمامية من صفحة واحدة بـ JavaScript خالص، مع حفظ البيانات في ملف JSON.",
    },
    stack: ["Node.js", "Express 5", "JWT", "bcryptjs", "JSON storage", "JavaScript", "CSS"],
    repo: "https://github.com/hfdkr/CODE-ARENA1",
    live: null,
    screens: [
      {
        src: "codearena-home",
        width: 1545,
        label: { en: "Quiz setup", fr: "Réglages du quiz", ar: "إعداد الاختبار" },
        alt: {
          en: "Code Arena home: 37 questions, 3 lessons, 4 categories, with category, difficulty and game-mode pickers.",
          fr: "Accueil de Code Arena : 37 questions, 3 leçons, 4 catégories, avec le choix de la catégorie, de la difficulté et du mode de jeu.",
          ar: "الصفحة الرئيسية لـ Code Arena: 37 سؤالاً و3 دروس و4 فئات، مع اختيار الفئة والصعوبة ووضع اللعب.",
        },
      },
      {
        src: "codearena-leaderboard",
        width: 1539,
        label: { en: "Leaderboard", fr: "Classement", ar: "المتصدّرون" },
        alt: {
          en: "Code Arena leaderboard ranking players by score, with category and game mode for each result.",
          fr: "Classement de Code Arena trié par score, avec la catégorie et le mode de jeu de chaque résultat.",
          ar: "لوحة المتصدّرين في Code Arena مرتّبة حسب النتيجة، مع الفئة ووضع اللعب لكل نتيجة.",
        },
      },
    ],
  },
];
