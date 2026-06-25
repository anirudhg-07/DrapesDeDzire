// Category groups: a parent collection slug -> the child category slugs that
// belong under it. Products only ever belong to ONE (child) category, so a
// "parent" collection page aggregates products across all of its children.
//
// Keep child slugs in sync with the sub-types offered in the Add Product drawer
// (KURTA_TYPES / JEWELLERY_TYPES) — slugs are lowercase-hyphenated category names.

export const CATEGORY_GROUPS: Record<string, string[]> = {
  // /collections/sarees shows every saree category
  "sarees": ["sarees", "kanchipuram-silk", "banarasi-silk", "chanderi", "georgette", "organza", "bridal", "designer"],
  // /collections/kurta-set shows every kurta sub-type
  "kurta-set": ["kurta-set", "anarkali", "straight-cut", "sharara", "palazzo"],
  // /collections/jewellery shows every jewellery type (plural slugs match the navbar;
  // singular kept for any older records)
  "jewellery": ["jewellery", "necklaces", "necklace", "earrings", "bangles", "rings", "pendants", "pendant", "sets", "set"],
};

// Friendly labels for the sub-category filter chips on a parent page.
export const CATEGORY_CHILD_LABELS: Record<string, { slug: string; label: string }[]> = {
  "sarees": [
    { slug: "kanchipuram-silk", label: "Kanchipuram Silk" },
    { slug: "banarasi-silk", label: "Banarasi Silk" },
    { slug: "chanderi", label: "Chanderi" },
    { slug: "georgette", label: "Georgette" },
    { slug: "bridal", label: "Bridal" },
    { slug: "designer", label: "Designer" },
  ],
  "kurta-set": [
    { slug: "anarkali", label: "Anarkali" },
    { slug: "straight-cut", label: "Straight Cut" },
    { slug: "sharara", label: "Sharara" },
  ],
  "jewellery": [
    { slug: "necklaces", label: "Necklaces" },
    { slug: "earrings", label: "Earrings" },
    { slug: "bangles", label: "Bangles" },
    { slug: "rings", label: "Rings" },
  ],
};

// Returns the list of slugs to query for a given collection slug.
// For a parent slug, that's all its children; otherwise just the slug itself.
export function slugsForCollection(slug: string): string[] {
  return CATEGORY_GROUPS[slug] ?? [slug];
}

export function isParentCollection(slug: string): boolean {
  return Boolean(CATEGORY_GROUPS[slug]);
}

// Friendly name for a parent collection slug (used when the DB category record
// doesn't exist yet, e.g. all kurtas live in sub-categories).
export const PARENT_LABELS: Record<string, string> = {
  "sarees": "Sarees",
  "kurta-set": "Kurta Sets",
  "jewellery": "Jewellery",
};

// Given any slug (parent OR child), return the group it belongs to so we can
// render the sub-category chips and an "All" link. Returns null if standalone.
export function groupForSlug(slug: string): { parentSlug: string; children: { slug: string; label: string }[] } | null {
  if (CATEGORY_GROUPS[slug]) {
    return { parentSlug: slug, children: CATEGORY_CHILD_LABELS[slug] ?? [] };
  }
  for (const parent of Object.keys(CATEGORY_GROUPS)) {
    if (CATEGORY_GROUPS[parent].includes(slug)) {
      return { parentSlug: parent, children: CATEGORY_CHILD_LABELS[parent] ?? [] };
    }
  }
  return null;
}
