import type { Lang } from '@/shared/types';

type Loc = Record<Lang, string>;

export interface Option {
  value: string;
  label: Loc;
}

const loc = (fr: string, ar: string, de: string, en: string): Loc => ({ fr, ar, de, en });

export const residenceOptions: Option[] = [
{ value: 'TN', label: loc('Tunisie', 'تونس', 'Tunesien', 'Tunisia') },
{ value: 'DZ', label: loc('Algérie', 'الجزائر', 'Algerien', 'Algeria') },
{ value: 'MA', label: loc('Maroc', 'المغرب', 'Marokko', 'Morocco') },
{ value: 'LY', label: loc('Libye', 'ليبيا', 'Libyen', 'Libya') },
{ value: 'FR', label: loc('France', 'فرنسا', 'Frankreich', 'France') },
{ value: 'DE', label: loc('Allemagne', 'ألمانيا', 'Deutschland', 'Germany') }];
