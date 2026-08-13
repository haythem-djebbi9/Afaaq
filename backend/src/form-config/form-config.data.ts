import { CountryCode, ServiceType } from '../../generated/prisma/client';
import { requirementsFor } from '../applications/document-requirements';
import type {
  FieldConfig,
  FieldOption,
  FormConfig,
  RepeatableFieldConfig,
  StepConfig,
} from './form-config.types';

const NATIONALITY_OPTIONS: FieldOption[] = [
  { value: 'TN', labelKey: 'opt.nationality.tn' },
  { value: 'DZ', labelKey: 'opt.nationality.dz' },
  { value: 'MA', labelKey: 'opt.nationality.ma' },
  { value: 'other', labelKey: 'opt.nationality.other' },
];

const GENDER_OPTIONS: FieldOption[] = [
  { value: 'f', labelKey: 'opt.gender.f' },
  { value: 'm', labelKey: 'opt.gender.m' },
  { value: 'x', labelKey: 'opt.gender.x' },
];

const LANGUAGE_OPTIONS: FieldOption[] = [
  { value: 'ar', labelKey: 'opt.lang.ar' },
  { value: 'fr', labelKey: 'opt.lang.fr' },
  { value: 'de', labelKey: 'opt.lang.de' },
  { value: 'en', labelKey: 'opt.lang.en' },
  { value: 'it', labelKey: 'opt.lang.it' },
];

const PROFICIENCY_OPTIONS: FieldOption[] = [
  { value: 'A1', labelKey: 'opt.level.a1' },
  { value: 'A2', labelKey: 'opt.level.a2' },
  { value: 'B1', labelKey: 'opt.level.b1' },
  { value: 'B2', labelKey: 'opt.level.b2' },
  { value: 'C1', labelKey: 'opt.level.c1' },
  { value: 'C2', labelKey: 'opt.level.c2' },
];

const DEGREE_OPTIONS: FieldOption[] = [
  { value: 'bac', labelKey: 'opt.degree.bac' },
  { value: 'bts', labelKey: 'opt.degree.bts' },
  { value: 'licence', labelKey: 'opt.degree.licence' },
  { value: 'master', labelKey: 'opt.degree.master' },
  { value: 'ing', labelKey: 'opt.degree.ing' },
  { value: 'phd', labelKey: 'opt.degree.phd' },
];

const FORMATION_LEVEL_OPTIONS: FieldOption[] = [
  { value: 'ausbildung', labelKey: 'opt.flevel.ausbildung' },
  { value: 'bachelor', labelKey: 'opt.flevel.bachelor' },
  { value: 'master', labelKey: 'opt.flevel.master' },
  { value: 'language', labelKey: 'opt.flevel.language' },
];

/**
 * Objective options depend on the chosen service, and — for the 'job' service — the
 * work-permit route's real name also depends on the target country (Blue Card in
 * Germany, Rot-Weiß-Rot-Karte in Austria, etc).
 */
function objectiveOptionsFor(
  service: ServiceType,
  country: CountryCode,
): FieldOption[] {
  switch (service) {
    case 'VISA':
      return [
        { value: 'study', labelKey: 'opt.obj.visa.study' },
        { value: 'jobseeker', labelKey: 'opt.obj.visa.jobseeker' },
        { value: 'work', labelKey: 'opt.obj.visa.work' },
        { value: 'family', labelKey: 'opt.obj.visa.family' },
      ];
    case 'TRAINING':
      return [
        { value: 'ausbildung', labelKey: 'opt.obj.training.ausbildung' },
        { value: 'university', labelKey: 'opt.obj.training.university' },
        { value: 'language', labelKey: 'opt.obj.training.language' },
      ];
    case 'JOB':
      return [
        { value: 'contract', labelKey: 'opt.obj.job.contract' },
        {
          value: 'permit',
          labelKey: `opt.obj.job.permit.${country.toLowerCase()}`,
        },
        { value: 'seasonal', labelKey: 'opt.obj.job.seasonal' },
      ];
    case 'DIPLOMA':
      return [
        { value: 'full', labelKey: 'opt.obj.diploma.full' },
        { value: 'partial', labelKey: 'opt.obj.diploma.partial' },
        { value: 'regulated', labelKey: 'opt.obj.diploma.regulated' },
      ];
  }
}

function field(config: Omit<FieldConfig, 'kind'>): FieldConfig {
  return { kind: 'field', ...config };
}

function repeatable(
  config: Omit<RepeatableFieldConfig, 'kind'>,
): RepeatableFieldConfig {
  return { kind: 'repeatable', ...config };
}

export function buildFormConfig(
  service: ServiceType,
  country: CountryCode,
): FormConfig {
  const requirements = requirementsFor(service, country);

  const steps: StepConfig[] = [
    {
      id: 'personal',
      order: 1,
      titleKey: 'step.personal',
      hintKey: 'hint.personal',
      kind: 'fields',
      fields: [
        field({
          key: 'firstName',
          type: 'text',
          labelKey: 'f.firstName',
          required: true,
        }),
        field({
          key: 'lastName',
          type: 'text',
          labelKey: 'f.lastName',
          required: true,
        }),
        field({ key: 'dob', type: 'date', labelKey: 'f.dob', required: true }),
        field({
          key: 'nationality',
          type: 'select',
          labelKey: 'f.nationality',
          required: true,
          options: NATIONALITY_OPTIONS,
        }),
        field({
          key: 'gender',
          type: 'select',
          labelKey: 'f.gender',
          required: false,
          options: GENDER_OPTIONS,
        }),
        field({
          key: 'address',
          type: 'text',
          labelKey: 'f.address',
          required: true,
        }),
        field({
          key: 'city',
          type: 'text',
          labelKey: 'f.city',
          required: true,
        }),
        field({
          key: 'postalCode',
          type: 'text',
          labelKey: 'f.postalCode',
          required: false,
        }),
        field({
          key: 'phone',
          type: 'tel',
          labelKey: 'auth.phone',
          required: true,
        }),
        field({
          key: 'email',
          type: 'email',
          labelKey: 'auth.email',
          required: true,
        }),
      ],
    },
    {
      id: 'passport',
      order: 2,
      titleKey: 'step.passport',
      hintKey: 'hint.passport',
      kind: 'fields',
      fields: [
        field({
          key: 'passportNumber',
          type: 'text',
          labelKey: 'f.passportNumber',
          required: true,
        }),
        field({
          key: 'issueDate',
          type: 'date',
          labelKey: 'f.issueDate',
          required: true,
        }),
        field({
          key: 'expiryDate',
          type: 'date',
          labelKey: 'f.expiryDate',
          required: true,
        }),
        field({
          key: 'issuingAuthority',
          type: 'text',
          labelKey: 'f.authority',
          required: false,
        }),
      ],
      documents: requirements
        .filter((r) => r.step === 2)
        .map((r) => ({
          type: r.type,
          labelKey: r.labelKey,
          required: r.required,
        })),
    },
    {
      id: 'languages',
      order: 3,
      titleKey: 'step.languages',
      hintKey: 'hint.languages',
      kind: 'fields',
      fields: [
        repeatable({
          key: 'languages',
          labelKey: 'step.languages',
          addLabelKey: 'f.language',
          minItems: 1,
          fields: [
            field({
              key: 'language',
              type: 'select',
              labelKey: 'f.language',
              required: true,
              options: LANGUAGE_OPTIONS,
            }),
            field({
              key: 'level',
              type: 'select',
              labelKey: 'f.level',
              required: true,
              options: PROFICIENCY_OPTIONS,
            }),
          ],
        }),
      ],
    },
    {
      id: 'education',
      order: 4,
      titleKey: 'step.education',
      hintKey: 'hint.education',
      kind: 'fields',
      fields: [
        repeatable({
          key: 'education',
          labelKey: 'step.education',
          addLabelKey: 'f.degree',
          minItems: 1,
          fields: [
            field({
              key: 'degree',
              type: 'select',
              labelKey: 'f.degree',
              required: true,
              options: DEGREE_OPTIONS,
            }),
            field({
              key: 'institution',
              type: 'text',
              labelKey: 'f.institution',
              required: true,
            }),
            field({
              key: 'country',
              type: 'text',
              labelKey: 'f.country',
              required: false,
            }),
            field({
              key: 'startDate',
              type: 'date',
              labelKey: 'f.startDate',
              required: true,
            }),
            field({
              key: 'endDate',
              type: 'date',
              labelKey: 'f.endDate',
              required: false,
            }),
          ],
        }),
      ],
    },
    {
      id: 'training',
      order: 5,
      titleKey: 'step.training',
      hintKey: 'hint.formation',
      kind: 'fields',
      fields: [
        repeatable({
          key: 'trainings',
          labelKey: 'step.training',
          addLabelKey: 'f.formationName',
          minItems: 0,
          fields: [
            field({
              key: 'name',
              type: 'text',
              labelKey: 'f.formationName',
              required: true,
            }),
            field({
              key: 'organism',
              type: 'text',
              labelKey: 'f.formationOrganism',
              required: true,
            }),
            field({
              key: 'level',
              type: 'select',
              labelKey: 'f.formationLevel',
              required: false,
              options: FORMATION_LEVEL_OPTIONS,
            }),
            field({
              key: 'startDate',
              type: 'date',
              labelKey: 'f.startDate',
              required: false,
            }),
            field({
              key: 'endDate',
              type: 'date',
              labelKey: 'f.endDate',
              required: false,
            }),
          ],
        }),
      ],
    },
    {
      id: 'experience',
      order: 6,
      titleKey: 'step.experience',
      hintKey: 'hint.experience',
      kind: 'fields',
      fields: [
        repeatable({
          key: 'experience',
          labelKey: 'step.experience',
          addLabelKey: 'f.jobTitle',
          minItems: 0,
          fields: [
            field({
              key: 'jobTitle',
              type: 'text',
              labelKey: 'f.jobTitle',
              required: true,
            }),
            field({
              key: 'company',
              type: 'text',
              labelKey: 'f.company',
              required: true,
            }),
            field({
              key: 'startDate',
              type: 'date',
              labelKey: 'f.startDate',
              required: true,
            }),
            field({
              key: 'endDate',
              type: 'date',
              labelKey: 'f.endDate',
              required: false,
            }),
            field({
              key: 'current',
              type: 'checkbox',
              labelKey: 'f.current',
              required: false,
            }),
          ],
        }),
      ],
    },
    {
      id: 'objective',
      order: 7,
      titleKey: 'step.objective',
      hintKey: 'hint.objective',
      kind: 'fields',
      fields: [
        field({
          key: 'choice',
          type: 'select',
          labelKey: 'f.objective',
          required: true,
          options: objectiveOptionsFor(service, country),
        }),
        field({
          key: 'notes',
          type: 'textarea',
          labelKey: 'f.objectiveNotes',
          required: false,
          maxLength: 600,
        }),
      ],
    },
    {
      id: 'payment',
      order: 8,
      titleKey: 'step.payment',
      hintKey: 'hint.payment',
      kind: 'payment',
    },
    {
      id: 'documents',
      order: 9,
      titleKey: 'step.documents',
      hintKey: 'hint.documents',
      kind: 'documents',
      documents: requirements
        .filter((r) => r.step === 8)
        .map((r) => ({
          type: r.type,
          labelKey: r.labelKey,
          required: r.required,
        })),
    },
    {
      id: 'review',
      order: 10,
      titleKey: 'step.review',
      kind: 'review',
    },
  ];

  return { service, country, steps };
}
