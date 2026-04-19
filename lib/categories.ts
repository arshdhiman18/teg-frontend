export const SECTIONS = ['Social & Home Celebrations', 'Signature Events'] as const;
export type SectionType = typeof SECTIONS[number];

export const CATEGORY_STRUCTURE: Record<SectionType, Record<string, string[]>> = {
  'Social & Home Celebrations': {
    'Birthday Decor': ['Kids Birthday'],
    'Anniversary Decor': ['Silver Jubilee'],
    'Baby Shower': [],
    'Newborn Welcome': [],
    'Proposal / Romantic Setup': [],
    'Bachelor / Bachelorette': [],
    'Wedding & Traditional Events': ['Roka & Engagement', 'Haldi', 'Mehendi'],
    'Specialized Setups': [
      'Table Setup / Centerpieces',
      'Floral / Thematic',
      'Traditional',
      'Kids Theme',
      'DJ, Sound & Lighting',
      'Kids Activities',
    ],
  },
  'Signature Events': {
    'Luxury Social Events': [],
    'Wedding Experiences': [],
    'Experiential Events': [],
    'Corporate Events': [],
    'Spiritual Gatherings': [],
  },
};

export const GENDER_OPTIONS = ['Male', 'Female', 'Unisex'] as const;
export const BUDGET_TAGS = ['Pocket', 'Premium', 'Luxury'] as const;

export const getAllMainCategories = (): string[] =>
  Object.values(CATEGORY_STRUCTURE).flatMap((cats) => Object.keys(cats));

export const getSubCategories = (mainCategory: string): string[] => {
  for (const section of SECTIONS) {
    const cats = CATEGORY_STRUCTURE[section];
    if (mainCategory in cats) return cats[mainCategory];
  }
  return [];
};

export const getSectionForCategory = (mainCategory: string): SectionType | null => {
  for (const section of SECTIONS) {
    if (mainCategory in CATEGORY_STRUCTURE[section]) return section;
  }
  return null;
};
