import { GlobeIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { languageOptions } from '@/shared/i18n/i18n';

interface Props {
  tone?: 'dark' | 'light';
}

export function LanguageSwitcher({ tone = 'dark' }: Props) {
  const { lang, setLang } = useLocale();
  const light = tone === 'light';

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-1 ${
      light ? 'border-white/25 bg-white/10' : 'border-ink-200 bg-white'}`
      }
      role="group"
      aria-label="Language">
      
      <GlobeIcon
        className={`ms-2 hidden h-4 w-4 sm:block ${light ? 'text-white/70' : 'text-ink-500'}`}
        aria-hidden="true" />

      {languageOptions.map((option) => {
        const active = option.code === lang;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLang(option.code)}
            aria-pressed={active}
            title={option.name}
            className={`rounded-full px-2 py-1.5 text-xs font-semibold transition-colors sm:px-3 ${
            active ?
            'bg-afaaq-blue text-white' :
            light ?
            'text-white/75 hover:text-white' :
            'text-ink-500 hover:text-afaaq-blue'}`
            }>
            
            {option.short}
          </button>);

      })}
    </div>);

}