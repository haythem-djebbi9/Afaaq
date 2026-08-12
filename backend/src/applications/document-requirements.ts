import { CountryCode, ServiceType } from '../../generated/prisma/client';

export interface DocumentRequirement {
  type: string;
  labelKey: string;
  required: boolean;
  /** Which wizard step renders this upload slot: 2 = passport copy, 8 = supporting documents. */
  step: 2 | 8;
}

const PASSPORT_COPY: DocumentRequirement = {
  type: 'passportCopy',
  labelKey: 'doc.type.passportCopy',
  required: true,
  step: 2,
};

const BASE_REQUIREMENTS: Record<ServiceType, DocumentRequirement[]> = {
  VISA: [
    { type: 'photo', labelKey: 'doc.type.photo', required: true, step: 8 },
    {
      type: 'proofOfFunds',
      labelKey: 'doc.type.proofOfFunds',
      required: true,
      step: 8,
    },
    {
      type: 'travelInsurance',
      labelKey: 'doc.type.travelInsurance',
      required: false,
      step: 8,
    },
  ],
  TRAINING: [
    { type: 'diploma', labelKey: 'doc.type.diploma', required: true, step: 8 },
    {
      type: 'transcripts',
      labelKey: 'doc.type.transcripts',
      required: true,
      step: 8,
    },
    {
      type: 'languageCert',
      labelKey: 'doc.type.languageCert',
      required: true,
      step: 8,
    },
    {
      type: 'motivationLetter',
      labelKey: 'doc.type.motivationLetter',
      required: false,
      step: 8,
    },
  ],
  JOB: [
    { type: 'cv', labelKey: 'doc.type.cv', required: true, step: 8 },
    {
      type: 'workCertificates',
      labelKey: 'doc.type.workCertificates',
      required: true,
      step: 8,
    },
    { type: 'diploma', labelKey: 'doc.type.diploma', required: true, step: 8 },
    {
      type: 'languageCert',
      labelKey: 'doc.type.languageCert',
      required: false,
      step: 8,
    },
  ],
  DIPLOMA: [
    {
      type: 'originalDiploma',
      labelKey: 'doc.type.originalDiploma',
      required: true,
      step: 8,
    },
    {
      type: 'certifiedTranslation',
      labelKey: 'doc.type.certifiedTranslation',
      required: true,
      step: 8,
    },
    {
      type: 'courseProgram',
      labelKey: 'doc.type.courseProgram',
      required: true,
      step: 8,
    },
    {
      type: 'idDocument',
      labelKey: 'doc.type.idDocument',
      required: true,
      step: 8,
    },
  ],
};

/** Country-specific extra documents, layered on top of the base service requirements. */
const COUNTRY_EXTRAS: Partial<
  Record<CountryCode, Partial<Record<ServiceType, DocumentRequirement[]>>>
> = {
  DE: {
    VISA: [
      {
        type: 'blockedAccount',
        labelKey: 'doc.type.blockedAccount',
        required: true,
        step: 8,
      },
    ],
    JOB: [
      {
        type: 'blockedAccount',
        labelKey: 'doc.type.blockedAccount',
        required: false,
        step: 8,
      },
    ],
  },
  IT: {
    VISA: [
      {
        type: 'codiceFiscale',
        labelKey: 'doc.type.codiceFiscale',
        required: false,
        step: 8,
      },
    ],
    TRAINING: [
      {
        type: 'codiceFiscale',
        labelKey: 'doc.type.codiceFiscale',
        required: false,
        step: 8,
      },
    ],
    JOB: [
      {
        type: 'codiceFiscale',
        labelKey: 'doc.type.codiceFiscale',
        required: false,
        step: 8,
      },
    ],
    DIPLOMA: [
      {
        type: 'codiceFiscale',
        labelKey: 'doc.type.codiceFiscale',
        required: false,
        step: 8,
      },
    ],
  },
  FR: {
    VISA: [
      {
        type: 'proofOfAccommodation',
        labelKey: 'doc.type.proofOfAccommodation',
        required: false,
        step: 8,
      },
    ],
  },
};

export function requirementsFor(
  service: ServiceType,
  country: CountryCode,
): DocumentRequirement[] {
  const extras = COUNTRY_EXTRAS[country]?.[service] ?? [];
  return [PASSPORT_COPY, ...BASE_REQUIREMENTS[service], ...extras];
}

export function requiredTypesFor(
  service: ServiceType,
  country: CountryCode,
): string[] {
  return requirementsFor(service, country)
    .filter((r) => r.required)
    .map((r) => r.type);
}

export function isKnownType(
  service: ServiceType,
  country: CountryCode,
  type: string,
): boolean {
  return requirementsFor(service, country).some((r) => r.type === type);
}
