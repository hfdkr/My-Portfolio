// "From the lab": smaller REST APIs written as course exercises at eWA Digitale.
// Every route below exists in the repository — check before adding one.

export const lab = [
  {
    id: "parcauto",
    name: "API ParcAuto",
    year: "2026",
    kind: { en: "Course exercise · solo", fr: "Exercice de cours · seul", ar: "تمرين دراسي · فردي" },
    summary: {
      en: "A REST API to manage the vehicles of a car-rental agency.",
      fr: "Une API REST pour gérer les véhicules d’une agence de location.",
      ar: "واجهة REST API لتسيير سيارات وكالة لكراء السيارات.",
    },
    notes: {
      en: [
        "Required fields and a unique registration plate are checked before anything is created",
        "Filter by availability with a query string: ?disponible=true",
        "Every error answers in JSON — 400, 404, invalid JSON, 500",
        "A logging middleware prints the method and URL of each request",
      ],
      fr: [
        "Champs obligatoires et immatriculation unique vérifiés avant toute création",
        "Filtre par disponibilité via la query string : ?disponible=true",
        "Chaque erreur répond en JSON — 400, 404, JSON invalide, 500",
        "Un middleware de journalisation affiche la méthode et l’URL de chaque requête",
      ],
      ar: [
        "التحقق من الحقول الإلزامية ومن تفرّد رقم التسجيل قبل أي إنشاء",
        "التصفية حسب التوفّر عبر سلسلة الاستعلام: ‎?disponible=true",
        "كل خطأ يُجاب عنه بصيغة JSON — ‏400، 404، JSON غير صالح، 500",
        "وسيط (middleware) لتسجيل طريقة كل طلب ورابطه",
      ],
    },
    routes: [
      ["GET", "/vehicules", "200"],
      ["GET", "/vehicules/:id", "200 · 404"],
      ["POST", "/vehicules", "201 · 400"],
      ["PATCH", "/vehicules/:id", "200 · 400 · 404"],
      ["DELETE", "/vehicules/:id", "204 · 404"],
    ],
    stack: ["Node.js", "Express 5", "ES modules", "dotenv", "Postman"],
    repo: "https://github.com/hfdkr/API-ParcAuto",
  },
  {
    id: "mediatheque",
    name: { en: "Media library API", fr: "API Médiathèque", ar: "API المكتبة" },
    year: "2026",
    kind: { en: "Course exercise · solo", fr: "Exercice de cours · seul", ar: "تمرين دراسي · فردي" },
    summary: {
      en: "Books, members and loans — three resources that depend on each other.",
      fr: "Livres, adhérents et emprunts — trois ressources qui dépendent l’une de l’autre.",
      ar: "كتب ومنخرطون وإعارات — ثلاثة موارد يعتمد بعضها على بعض.",
    },
    notes: {
      en: [
        "A loan is refused if the book or the member does not exist",
        "A book already on loan cannot be borrowed again",
        "Creating a loan marks the book as unavailable",
      ],
      fr: [
        "Un emprunt est refusé si le livre ou l’adhérent n’existe pas",
        "Un livre déjà emprunté ne peut pas l’être à nouveau",
        "Créer un emprunt rend le livre indisponible",
      ],
      ar: [
        "تُرفض الإعارة إذا لم يكن الكتاب أو المنخرط موجوداً",
        "لا يمكن إعارة كتاب مُعار أصلاً",
        "إنشاء إعارة يجعل الكتاب غير متوفّر",
      ],
    },
    routes: [
      ["GET", "/livres", "200"],
      ["PATCH", "/livres/:id", "200 · 404"],
      ["POST", "/adherents", "201 · 400"],
      ["DELETE", "/adherents/:id", "204 · 404"],
      ["POST", "/emprunts", "201 · 400 · 404"],
    ],
    stack: ["Node.js", "Express 5", "ES modules"],
    repo: "https://github.com/hfdkr/tp-api",
  },
];
