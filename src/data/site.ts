// Brand strings live ONLY here. Never hardcode the name, handle, or domain
// anywhere else in the codebase — see CLAUDE.md "Conventions".
export const BRAND = {
  displayName: 'The Drone Ninja',
  instagramHandle: '@the.drone.ninja',
  instagramUrl: 'https://instagram.com/the.drone.ninja',
} as const;

export interface Category {
  id: string;
  pt: string;
  en: string;
}

// Open task 4: rename these once the Instagram back catalogue is sorted.
// Categories with no matching project hide themselves automatically via
// activeCategories() below — no other change is needed when renaming/pruning.
export const CATEGORIES: Category[] = [
  { id: 'real-estate', pt: 'Imobiliário', en: 'Real Estate' },
  { id: 'events', pt: 'Eventos', en: 'Events' },
  { id: 'construction', pt: 'Construção', en: 'Construction' },
];

export function activeCategories(projects: { category: string }[]): Category[] {
  const used = new Set(projects.map((p) => p.category));
  return CATEGORIES.filter((c) => used.has(c.id));
}

// Open task 5: fill these in. Left as placeholders on purpose — do not
// invent plausible-looking values.
export interface OperatorInfo {
  operatorId: string;
  certificates: string[];
  insuredTo: string;
  whatsapp: string;
}

export const OPERATOR: OperatorInfo = {
  operatorId: 'TODO',
  certificates: [],
  insuredTo: 'TODO',
  whatsapp: 'TODO',
};

// Builds a full media URL from an R2 object key at request time.
// `mediaBase` must come from the PUBLIC_MEDIA_BASE runtime env var
// (Astro.locals.runtime.env.PUBLIC_MEDIA_BASE) — never hardcode a domain.
export function mediaUrl(mediaBase: string, key: string): string {
  return `${mediaBase.replace(/\/$/, '')}/${key.replace(/^\//, '')}`;
}
