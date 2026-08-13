import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { translate } from '@/shared/i18n/i18n';
import type { Lang } from '@/shared/types';

interface LocaleValue {
  lang: Lang;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: {children: ReactNode;}) {
  const [lang, setLang] = useState<Lang>('fr');
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo(() => ({ lang, dir: dir as 'ltr' | 'rtl', setLang, t }), [lang, dir, t]);

  return (
    <LocaleContext.Provider value={value}>
      <div dir={dir} lang={lang} className="min-h-full w-full">
        {children}
      </div>
    </LocaleContext.Provider>);

}

export function useLocale(): LocaleValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}