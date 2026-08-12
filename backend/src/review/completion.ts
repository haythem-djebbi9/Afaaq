import type { DocumentRequirement } from '../applications/document-requirements';

interface ApplicationLike {
  personal: unknown;
  passport: unknown;
  languages: unknown;
  education: unknown;
  objective: unknown;
}

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function isNonEmptyArray(v: unknown): v is unknown[] {
  return Array.isArray(v) && v.length > 0;
}

/** Lightweight completion heuristic across the 6 sections with mandatory content. */
export function computeCompletion(
  application: ApplicationLike,
  requirements: DocumentRequirement[],
  uploadedTypes: Set<string>,
): number {
  const personalOk = isObj(application.personal) && !!application.personal.firstName && !!application.personal.lastName;
  const passportOk = isObj(application.passport) && !!application.passport.passportNumber;
  const languagesOk = isNonEmptyArray(application.languages);
  const educationOk = isNonEmptyArray(application.education);
  const objectiveOk = isObj(application.objective) && !!application.objective.choice;

  const required = requirements.filter((r) => r.required);
  const documentsFraction = required.length === 0
    ? 1
    : required.filter((r) => uploadedTypes.has(r.type)).length / required.length;

  const score =
    Number(personalOk) +
    Number(passportOk) +
    Number(languagesOk) +
    Number(educationOk) +
    Number(objectiveOk) +
    documentsFraction;

  return Math.round((score / 6) * 100);
}
