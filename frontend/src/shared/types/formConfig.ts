export type FormFieldType = 'text' | 'date' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';

export interface FieldOption {
  value: string;
  labelKey: string;
}

export interface FieldConfig {
  kind: 'field';
  key: string;
  type: FormFieldType;
  labelKey: string;
  required: boolean;
  hintKey?: string;
  placeholderKey?: string;
  options?: FieldOption[];
  maxLength?: number;
}

export interface RepeatableFieldConfig {
  kind: 'repeatable';
  key: string;
  labelKey: string;
  addLabelKey: string;
  minItems: number;
  fields: FieldConfig[];
}

export type StepField = FieldConfig | RepeatableFieldConfig;

export interface DocumentRequirementConfig {
  type: string;
  labelKey: string;
  required: boolean;
}

export type StepKind = 'fields' | 'documents' | 'payment' | 'review';

export interface StepConfig {
  id: string;
  order: number;
  titleKey: string;
  hintKey?: string;
  kind: StepKind;
  fields?: StepField[];
  documents?: DocumentRequirementConfig[];
}

export interface FormConfig {
  service: string;
  country: string;
  steps: StepConfig[];
}
