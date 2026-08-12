import React from 'react';
import { CheckCircle2Icon, ShieldCheckIcon } from 'lucide-react';
import { useLocale } from '../contexts/LocaleContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';

interface Props {
  children: React.ReactNode;
}

export function AuthLayout({ children }: Props) {
  const { t } = useLocale();
  const points = [t('brand.point1'), t('brand.point2'), t('brand.point3')];

  return (
    <div className="min-h-screen w-full bg-surface">
      <div className="mx-auto grid min-h-screen w-full max-w-shell grid-cols-1 lg:grid-cols-[minmax(0,520px)_1fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-afaaq-blue p-12 lg:flex">
          <div
            className="absolute -top-24 -end-24 h-72 w-72 rounded-full border-[32px] border-white/5"
            aria-hidden="true" />
          
          <div
            className="absolute -bottom-32 -start-16 h-80 w-80 rounded-full border-[40px] border-afaaq-gold/10"
            aria-hidden="true" />
          

          <Logo tone="light" size={44} />

          <div className="relative z-10">
            <h1 className="font-display text-[34px] font-bold leading-tight text-white">
              {t('brand.tagline')}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">{t('brand.pitch')}</p>
            <ul className="mt-8 flex flex-col gap-3">
              {points.map((point) =>
              <li key={point} className="flex items-start gap-3 text-sm text-white/85">
                  <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-afaaq-gold" aria-hidden="true" />
                  {point}
                </li>
              )}
            </ul>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-white/60">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
            {t('auth.secure')} · TLS 1.3
          </div>
        </aside>

        <main className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="sm:hidden">
              <Logo size={34} variant="mark" />
            </div>
            <div className="hidden sm:block lg:hidden">
              <Logo size={36} />
            </div>
            <div className="ms-auto">
              <LanguageSwitcher />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-[440px]">{children}</div>
          </div>
        </main>
      </div>
    </div>);

}