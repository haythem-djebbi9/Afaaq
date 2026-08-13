import type { CountryCode, Lang } from '@/shared/types';

export const heroBackground = "/hero-bg.jpg";


export const videoPoster = "/hero-bg.jpg";


export const videoSource =
'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4';

export const stats: {target: number;suffix: string;decimals?: number;labelKey: string;}[] = [
{ target: 4200, suffix: '+', labelKey: 'home.stat1' },
{ target: 92, suffix: ' %', labelKey: 'home.stat2' },
{ target: 150, suffix: '+', labelKey: 'home.stat3' },
{ target: 48, suffix: ' h', labelKey: 'home.stat4' }];


export const partners: string[] = [
'Bundesagentur für Arbeit',
'ZAB Anerkennung',
'Goethe-Institut',
'Campus France',
'AMS Österreich',
'Uni-Assist',
'Decreto Flussi',
'Handwerkskammer'];


export const faq: {qKey: string;aKey: string;}[] = [
{ qKey: 'home.faq.q1', aKey: 'home.faq.a1' },
{ qKey: 'home.faq.q2', aKey: 'home.faq.a2' },
{ qKey: 'home.faq.q3', aKey: 'home.faq.a3' },
{ qKey: 'home.faq.q4', aKey: 'home.faq.a4' }];


export const howItWorks: {titleKey: string;descKey: string;}[] = [
{ titleKey: 'home.how.s1t', descKey: 'home.how.s1d' },
{ titleKey: 'home.how.s2t', descKey: 'home.how.s2d' },
{ titleKey: 'home.how.s3t', descKey: 'home.how.s3d' },
{ titleKey: 'home.how.s4t', descKey: 'home.how.s4d' }];


export const countryHighlights: {code: CountryCode;descKey: string;}[] = [
{ code: 'DE', descKey: 'home.countries.deDesc' },
{ code: 'AT', descKey: 'home.countries.atDesc' },
{ code: 'IT', descKey: 'home.countries.itDesc' },
{ code: 'FR', descKey: 'home.countries.frDesc' }];


export interface Story {
  id: string;
  quoteKey: string;
  name: string;
  avatar: string;
  role: Record<Lang, string>;
}

function initialsAvatar(initials: string): string {
  const svg =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">` +
  `<rect width="96" height="96" rx="48" fill="#0D47A1"/>` +
  `<text x="48" y="61" font-family="Poppins, Arial, sans-serif" font-size="32" font-weight="700" fill="#FFC107" text-anchor="middle">${initials}</text>` +
  `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const stories: Story[] = [
{
  id: 'karim',
  quoteKey: 'home.story1',
  name: 'Karim Trabelsi',
  avatar: "/e832c94d-a8bc-41ca-9560-0919ff5415a6.jpg",
  role: {
    fr: 'Ausbildung réseau · Munich 🇩🇪',
    ar: 'تكوين مزدوج في الشبكات · ميونخ 🇩🇪',
    de: 'Ausbildung Netzwerktechnik · München 🇩🇪',
    en: 'Network Ausbildung · Munich 🇩🇪'
  }
},
{
  id: 'ines',
  quoteKey: 'home.story2',
  name: 'Inès Gharbi',
  avatar: initialsAvatar('IG'),
  role: {
    fr: 'Infirmière diplômée · Vienne 🇦🇹',
    ar: 'ممرضة مجازة · فيينا 🇦🇹',
    de: 'Examinierte Pflegekraft · Wien 🇦🇹',
    en: 'Registered nurse · Vienna 🇦🇹'
  }
},
{
  id: 'mehdi',
  quoteKey: 'home.story3',
  name: 'Mehdi Aouadi',
  avatar: "/e0fd3cb4-60f0-4e61-a610-6b9df7a141d3.jpg",
  role: {
    fr: 'Ingénieur logiciel · Vienne 🇦🇹',
    ar: 'مهندس برمجيات · فيينا 🇦🇹',
    de: 'Softwareingenieur · Wien 🇦🇹',
    en: 'Software engineer · Vienna 🇦🇹'
  }
}];