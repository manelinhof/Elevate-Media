import rawProjects from '../data/projects.json';

export interface Project {
  slug: string;
  category: string;
  title: { pt: string; en: string };
  poster: string;
  loop: string;
  // uhd is optional — ingest.sh only generates a 4K rendition when the
  // source footage actually is 4K (see its own comment); older projects
  // ingested before that check existed, or from sub-4K source, won't have
  // one. The quality toggle (work/[slug].astro) falls back to a 2-way
  // SD/HD picker when it's absent, rather than requiring it.
  reel: { sd: string; hd: string; uhd?: string };
  publishedAt: string;
  featured: boolean;
  // Optional, higher-res (2160p) sibling of `loop`, generated only when
  // ingest.sh also generates a 4K reel. Hero.astro (the Works listing
  // page's banner) prefers this over `loop` when present — see its own
  // comment for why that's a deliberate exception to "tiles/hero only ever
  // autoplay the small silent loop", not a full-reel regression.
  heroLoop?: string;
  // Both optional and hand-added, not part of ingest.sh's output — the
  // owner pastes these in after the fact if/when there's real copy or BTS
  // stills for a project. Absent on every project today; the detail page
  // (work/[slug].astro) renders around their absence rather than requiring
  // them, per CLAUDE.md's "no CMS, manual JSON paste" workflow.
  description?: { pt: string; en: string };
  btsPhotos?: string[];
}

// Hand-rolled shape check rather than a validation library — the schema is
// small and stable, and it's the owner's own ingest.sh output being pasted
// in, not untrusted external input.
function isProject(value: unknown): value is Project {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  const title = p.title as Record<string, unknown> | undefined;
  const reel = p.reel as Record<string, unknown> | undefined;
  const description = p.description as Record<string, unknown> | undefined;
  const validDescription =
    description === undefined || (typeof description.pt === 'string' && typeof description.en === 'string');
  const validBtsPhotos =
    p.btsPhotos === undefined ||
    (Array.isArray(p.btsPhotos) && p.btsPhotos.every((photo) => typeof photo === 'string'));
  const validUhd = reel?.uhd === undefined || typeof reel.uhd === 'string';
  const validHeroLoop = p.heroLoop === undefined || typeof p.heroLoop === 'string';
  return (
    typeof p.slug === 'string' &&
    typeof p.category === 'string' &&
    typeof title?.pt === 'string' &&
    typeof title?.en === 'string' &&
    typeof p.poster === 'string' &&
    typeof p.loop === 'string' &&
    typeof reel?.sd === 'string' &&
    typeof reel?.hd === 'string' &&
    typeof p.publishedAt === 'string' &&
    typeof p.featured === 'boolean' &&
    validDescription &&
    validBtsPhotos &&
    validHeroLoop &&
    validUhd
  );
}

const projects: Project[] = (rawProjects as unknown[]).filter(isProject);

export function getProjects(): Project[] {
  return projects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
