export const REVIEW_SECTIONS = [
  'personal',
  'passport',
  'languages',
  'education',
  'training',
  'experience',
  'objective',
  'documents',
] as const;

export type ReviewSection = (typeof REVIEW_SECTIONS)[number];

export function isReviewSection(value: string): value is ReviewSection {
  return (REVIEW_SECTIONS as readonly string[]).includes(value);
}
