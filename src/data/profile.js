// Personal information. Text shown on the page is written as { en, fr, ar }.

export const profile = {
  name: "Hafid Karkouch",
  // The two lines of the big name in the hero. Arabic is shown when the site is in Arabic.
  nameLines: { latin: ["Hafid", "Karkouch"], ar: ["حفيظ", "كركوش"] },
  timeZone: "Africa/Casablanca",

  // Shown in the status widget. Edit by hand — it is not a live availability feed.
  status: { open: true, updated: "2026-11" },

  email: "hafidkarkouch5@gmail.com",
  links: {
    github: "https://github.com/hfdkr",
    linkedin: "https://www.linkedin.com/in/hafid-k/",
  },

  facts: [
    {
      label: "about.based",
      value: { en: "Agadir, Morocco", fr: "Agadir, Maroc", ar: "أكادير، المغرب" },
    },
    {
      label: "about.studying",
      value: {
        en: "Technicien Spécialisé en Développement Full Stack, eWA Digitale (2025–2027)",
        fr: "Technicien Spécialisé en Développement Full Stack, eWA Digitale (2025–2027)",
        ar: "تقني متخصص في تطوير الويب الشامل (Full Stack)، eWA Digitale ‏(2025–2027)",
      },
    },
    {
      label: "about.languages",
      value: {
        en: "Amazigh (native), Arabic (fluent), French (intermediate), English (intermediate)",
        fr: "Amazigh (langue maternelle), arabe (courant), français (intermédiaire), anglais (intermédiaire)",
        ar: "الأمازيغية (اللغة الأم)، العربية (بطلاقة)، الفرنسية (متوسط)، الإنجليزية (متوسط)",
      },
    },
    {
      label: "about.certificate",
      value: {
        en: "Responsive Web Design — freeCodeCamp",
        fr: "Responsive Web Design — freeCodeCamp",
        ar: "Responsive Web Design — freeCodeCamp",
      },
      href: "https://www.freecodecamp.org/certification/hafid_karkouch/responsive-web-design",
    },
  ],
};
