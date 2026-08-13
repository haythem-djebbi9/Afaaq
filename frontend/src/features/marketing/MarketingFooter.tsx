import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { Logo } from '@/shared/components/Logo';

export function MarketingFooter() {
  const { t } = useLocale();

  return (
    <footer className="w-full bg-afaaq-blue-900 py-14 text-white/70">
      <div className="mx-auto grid w-full max-w-shell gap-10 px-6 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Logo tone="light" size={42} />
          <p className="mt-4 max-w-sm text-sm leading-6">{t('brand.pitch')}</p>
        </div>

        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-center gap-3">
            <MapPinIcon className="h-4 w-4 text-afaaq-gold" aria-hidden="true" />
            Avenue Habib Bourguiba, Tunis
          </li>
          <li className="flex items-center gap-3">
            <PhoneIcon className="h-4 w-4 text-afaaq-gold" aria-hidden="true" />
            +216 71 000 000
          </li>
          <li className="flex items-center gap-3">
            <MailIcon className="h-4 w-4 text-afaaq-gold" aria-hidden="true" />
            contact@afaaq-connect.tn
          </li>
        </ul>

        <ul className="flex flex-col gap-3 text-sm">
          {['home.footer.legal', 'home.footer.privacy', 'home.footer.contact'].map((key) =>
          <li key={key}>
              <a href="#top" className="transition-colors hover:text-white">
                {t(key)}
              </a>
            </li>
          )}
        </ul>
      </div>

      <div className="mx-auto mt-10 w-full max-w-shell border-t border-white/10 px-6 pt-6 text-xs lg:px-10">
        © 2026 AFAAQ CONNECT. {t('home.footer.rights')}
      </div>
    </footer>);

}