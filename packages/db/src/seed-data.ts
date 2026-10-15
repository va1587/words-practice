import type { LearningPath, Lesson } from "@devmentor/core";

// Initial content for `npm run db:seed` (former mock data of the UI template).
type SeedPath = Omit<LearningPath, "featured"> & { featured?: boolean };

export const seedPaths: SeedPath[] = [
  {
    slug: "frontend-foundations",
    title: "Frontend od podstaw",
    tagline: "HTML, CSS i JavaScript bez skrótów.",
    description:
      "Solidne fundamenty tworzenia stron: semantyczny HTML, nowoczesny CSS i JavaScript w przeglądarce. Idealny start przed frameworkami.",
    level: "beginner",
    hours: 24,
    tags: ["HTML", "CSS", "JavaScript"],
    featured: true,
    modules: [
      {
        title: "Struktura strony",
        lessons: [
          lesson("semantic-html", "Semantyczny HTML", 20),
          lesson("forms", "Formularze i dostępność", 30),
        ],
      },
      {
        title: "Stylowanie",
        lessons: [
          lesson("box-model", "Model pudełkowy", 25),
          lesson("flexbox-grid", "Flexbox i Grid", 40),
          lesson("responsive", "Responsywność", 35),
        ],
      },
      {
        title: "JavaScript w przeglądarce",
        lessons: [
          lesson("dom", "Praca z DOM", 30),
          lesson("events", "Zdarzenia", 25),
          lesson("fetch", "Pobieranie danych", 35),
        ],
      },
    ],
  },
  {
    slug: "react-in-practice",
    title: "React w praktyce",
    tagline: "Komponenty, stan i dane — krok po kroku.",
    description:
      "Budujesz realną aplikację w React: komponenty, hooki, zarządzanie stanem, pobieranie danych i testy.",
    level: "intermediate",
    hours: 30,
    tags: ["React", "TypeScript", "Testy"],
    featured: true,
    modules: [
      {
        title: "Komponenty",
        lessons: [
          lesson("jsx", "JSX i propsy", 20),
          lesson("composition", "Kompozycja komponentów", 30),
        ],
      },
      {
        title: "Stan i efekty",
        lessons: [
          lesson("use-state", "useState i zdarzenia", 30),
          lesson("use-effect", "Efekty uboczne", 35),
          lesson("custom-hooks", "Własne hooki", 40),
        ],
      },
      {
        title: "Jakość",
        lessons: [
          lesson("testing-library", "Testing Library", 45),
          lesson("performance", "Wydajność renderowania", 35),
        ],
      },
    ],
  },
  {
    slug: "backend-node",
    title: "Backend w Node.js",
    tagline: "API, bazy danych i bezpieczeństwo.",
    description:
      "Projektujesz i budujesz REST API w Node.js: routing, walidacja, baza danych SQL, uwierzytelnianie i wdrożenie.",
    level: "intermediate",
    hours: 28,
    tags: ["Node.js", "SQL", "REST"],
    featured: true,
    modules: [
      {
        title: "HTTP i API",
        lessons: [
          lesson("http-basics", "Podstawy HTTP", 20),
          lesson("rest-design", "Projektowanie REST", 30),
        ],
      },
      {
        title: "Dane",
        lessons: [
          lesson("sql-intro", "SQL od zera", 40),
          lesson("migrations", "Migracje i ORM", 35),
        ],
      },
      {
        title: "Bezpieczeństwo",
        lessons: [lesson("auth", "Uwierzytelnianie", 40), lesson("owasp", "OWASP Top 10", 45)],
      },
    ],
  },
  {
    slug: "system-design",
    title: "Projektowanie systemów",
    tagline: "Myśl jak architekt.",
    description:
      "Skalowanie, cache, kolejki i kompromisy architektoniczne. Przygotowanie do rozmów system design.",
    level: "advanced",
    hours: 20,
    tags: ["Architektura", "Skalowanie"],
    modules: [
      {
        title: "Fundamenty",
        lessons: [
          lesson("tradeoffs", "Kompromisy i wymagania", 30),
          lesson("caching", "Cache", 35),
        ],
      },
      {
        title: "Systemy rozproszone",
        lessons: [
          lesson("queues", "Kolejki i zdarzenia", 40),
          lesson("consistency", "Spójność danych", 45),
        ],
      },
    ],
  },
];

export const seedDemoUser = {
  email: "ola@devmentor.dev",
  name: "Ola",
  streakDays: 6,
  activePaths: ["frontend-foundations", "react-in-practice"],
  completedLessons: [
    "frontend-foundations/semantic-html",
    "frontend-foundations/forms",
    "frontend-foundations/box-model",
    "frontend-foundations/flexbox-grid",
    "react-in-practice/jsx",
  ],
};

function lesson(slug: string, title: string, minutes: number): Lesson {
  return {
    slug,
    title,
    minutes,
    summary: `Krótko i konkretnie: ${title.toLowerCase()} — teoria, przykłady i ćwiczenie.`,
    body: [
      `W tej lekcji poznasz temat „${title}”. Zaczniemy od tego, po co to jest i jakie problemy rozwiązuje.`,
      "Następnie przejdziemy przez przykład krok po kroku, zwracając uwagę na typowe błędy i dobre praktyki.",
      "Na końcu czeka Cię zadanie praktyczne — zrób je samodzielnie, zanim zajrzysz do rozwiązania.",
    ],
    exercise: `Zastosuj „${title}” w małym projekcie i opisz w 3 zdaniach, czego się nauczyłeś(-aś).`,
  };
}
