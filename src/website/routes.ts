// The website's pages and their addresses. Each page has its own readable address (/howitworks/, /privacy/…)
// so search engines can list it; old #how-style links still work (Site.tsx).
export const PAGES = ["home", "how", "officials", "faq", "contact", "privacy", "terms"] as const;
export type Page = (typeof PAGES)[number];

const SLUG: Record<Page, string> = {
  home: "",
  how: "howitworks",
  officials: "officials",
  faq: "faq",
  contact: "contact",
  privacy: "privacy",
  terms: "terms",
};

export const isPage = (x: string): x is Page => (PAGES as readonly string[]).includes(x);

/** "/" for home, "/<slug>/" for the others. */
export const pathOf = (p: Page): string => (p === "home" ? "/" : "/" + SLUG[p] + "/");

/** The page a path segment ("faq", "howitworks") names, or null. */
export const pageFromSlug = (seg: string): Page | null => PAGES.find((p) => p !== "home" && SLUG[p] === seg) ?? null;

/** The slugs of every page but home: one exported HTML file each. */
export const subpageSlugs = (): string[] => PAGES.filter((p) => p !== "home").map((p) => SLUG[p]);
