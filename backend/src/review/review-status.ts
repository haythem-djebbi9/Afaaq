export type DerivedDossierStatus = 'pending' | 'approved' | 'needs_correction';

export function deriveDossierStatus(
  sectionReviews: { status: string }[],
  dossierReview: { status: string } | null | undefined,
): DerivedDossierStatus {
  if (dossierReview?.status === 'VALIDATED') return 'approved';
  if (sectionReviews.some((s) => s.status === 'NEEDS_CORRECTION')) return 'needs_correction';
  return 'pending';
}
