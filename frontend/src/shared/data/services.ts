import type { CountryCode, ServiceId } from '@/shared/types';

export interface ServiceDef {
  id: ServiceId;
  titleKey: string;
  descKey: string;
  icon: 'stamp' | 'graduation' | 'briefcase' | 'certificate';
  steps: number;
  duration: {fr: string;ar: string;de: string;en: string;};
  countries: CountryCode[];
}

export const countries: {code: CountryCode;flag: string;name: {fr: string;ar: string;de: string;en: string;};}[] = [
{ code: 'DE', flag: '🇩🇪', name: { fr: 'Allemagne', ar: 'ألمانيا', de: 'Deutschland', en: 'Germany' } },
{ code: 'AT', flag: '🇦🇹', name: { fr: 'Autriche', ar: 'النمسا', de: 'Österreich', en: 'Austria' } },
{ code: 'IT', flag: '🇮🇹', name: { fr: 'Italie', ar: 'إيطاليا', de: 'Italien', en: 'Italy' } },
{ code: 'FR', flag: '🇫🇷', name: { fr: 'France', ar: 'فرنسا', de: 'Frankreich', en: 'France' } }];


export const services: ServiceDef[] = [
{
  id: 'visa',
  titleKey: 'svc.visa.title',
  descKey: 'svc.visa.desc',
  icon: 'stamp',
  steps: 10,
  duration: { fr: '6 – 10 semaines', ar: '٦ – ١٠ أسابيع', de: '6 – 10 Wochen', en: '6 – 10 weeks' },
  countries: ['DE', 'AT', 'IT', 'FR']
},
{
  id: 'training',
  titleKey: 'svc.training.title',
  descKey: 'svc.training.desc',
  icon: 'graduation',
  steps: 10,
  duration: { fr: '3 – 6 mois', ar: '٣ – ٦ أشهر', de: '3 – 6 Monate', en: '3 – 6 months' },
  countries: ['DE', 'AT', 'FR', 'IT']
},
{
  id: 'job',
  titleKey: 'svc.job.title',
  descKey: 'svc.job.desc',
  icon: 'briefcase',
  steps: 10,
  duration: { fr: '2 – 5 mois', ar: '٢ – ٥ أشهر', de: '2 – 5 Monate', en: '2 – 5 months' },
  countries: ['DE', 'AT', 'IT', 'FR']
},
{
  id: 'diploma',
  titleKey: 'svc.diploma.title',
  descKey: 'svc.diploma.desc',
  icon: 'certificate',
  steps: 10,
  duration: { fr: '8 – 14 semaines', ar: '٨ – ١٤ أسبوعًا', de: '8 – 14 Wochen', en: '8 – 14 weeks' },
  countries: ['DE', 'AT', 'IT', 'FR']
}];


export const draftApplications = [
{ service: 'visa' as ServiceId, country: 'DE' as CountryCode, progress: 66, ref: 'AFQ-2026-01184' },
{ service: 'diploma' as ServiceId, country: 'AT' as CountryCode, progress: 24, ref: 'AFQ-2026-00937' }];