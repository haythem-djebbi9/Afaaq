import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  AwardIcon,
  BriefcaseBusinessIcon,
  ClockIcon,
  GraduationCapIcon,
  LayersIcon,
  StampIcon } from
'lucide-react';
import { motion } from 'framer-motion';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { countries, draftApplications, services } from '../data/services';
import type { CountryCode, ServiceId } from '../types';

const icons = {
  stamp: StampIcon,
  graduation: GraduationCapIcon,
  briefcase: BriefcaseBusinessIcon,
  certificate: AwardIcon
};

export function Services() {
  const { t, lang, dir } = useLocale();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Record<ServiceId, CountryCode>>({
    visa: 'DE',
    training: 'DE',
    job: 'AT',
    diploma: 'DE'
  });

  const start = (service: ServiceId) => navigate(`/apply/new?service=${service}&country=${selected[service]}`);

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />

      <main className="mx-auto w-full max-w-shell px-6 py-10 lg:px-10">
        <p className="text-sm font-medium text-afaaq-blue">
          {t('services.greeting', { name: user?.fullName.split(' ')[0] ?? '' })}
        </p>
        <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-ink-900">
          {t('services.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-500">{t('services.subtitle')}</p>

        <section aria-label={t('services.title')} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, index) => {
            const Icon = icons[service.icon];
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}>
                
                <Card as="article" className="flex h-full flex-col p-7 transition-shadow hover:shadow-lift">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-afaaq-blue-50 text-afaaq-blue">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold text-ink-900">{t(service.titleKey)}</h2>
                      <p className="mt-1.5 text-sm leading-6 text-ink-500">{t(service.descKey)}</p>
                    </div>
                  </div>

                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-y border-ink-200/70 py-4 text-xs">
                    <div className="flex items-center gap-2">
                      <LayersIcon className="h-4 w-4 text-afaaq-gold-600" aria-hidden="true" />
                      <dt className="sr-only">{t('services.steps')}</dt>
                      <dd className="font-medium text-ink-700">
                        {service.steps} {t('services.steps')}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-afaaq-gold-600" aria-hidden="true" />
                      <dt className="text-ink-500">{t('services.duration')}:</dt>
                      <dd className="font-medium text-ink-700">{service.duration[lang]}</dd>
                    </div>
                  </dl>

                  <fieldset className="mt-5">
                    <legend className="mb-2.5 text-[13px] font-medium text-ink-700">
                      {t('services.targetCountry')}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {service.countries.map((code) => {
                        const country = countries.find((c) => c.code === code)!;
                        const active = selected[service.id] === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelected((prev) => ({ ...prev, [service.id]: code }))}
                            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                            active ?
                            'border-afaaq-blue bg-afaaq-blue-50 text-afaaq-blue' :
                            'border-ink-200 bg-white text-ink-500 hover:border-afaaq-blue/40'}`
                            }>
                            
                            <span aria-hidden="true">{country.flag}</span>
                            {country.name[lang]}
                          </button>);

                      })}
                    </div>
                  </fieldset>

                  <div className="mt-7 flex items-center justify-end">
                    <Button onClick={() => start(service.id)}>
                      {t('services.start')}
                      <ArrowRightIcon
                        className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                        aria-hidden="true" />
                      
                    </Button>
                  </div>
                </Card>
              </motion.div>);

          })}
        </section>

        <section aria-labelledby="drafts" className="mt-12">
          <h2 id="drafts" className="font-display text-lg font-bold text-ink-900">
            {t('services.inProgress')}
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {draftApplications.map((draft) => {
              const service = services.find((s) => s.id === draft.service)!;
              const country = countries.find((c) => c.code === draft.country)!;
              return (
                <Card key={draft.ref} className="flex items-center gap-5 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-bold text-ink-900">
                        {t(service.titleKey)}
                      </span>
                      <span className="text-xs text-ink-500">
                        <span aria-hidden="true">{country.flag}</span> {country.name[lang]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">{draft.ref}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-ink-200"
                        role="progressbar"
                        aria-valuenow={draft.progress}
                        aria-valuemin={0}
                        aria-valuemax={100}>
                        
                        <div
                          className="h-full rounded-full bg-afaaq-gold"
                          style={{ width: `${draft.progress}%` }} />
                        
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-ink-700">
                        {draft.progress}% {t('services.complete')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/apply/${draft.service}?country=${draft.country}`)}>
                    
                    {t('services.resume')}
                  </Button>
                </Card>);

            })}
          </div>
        </section>
      </main>
    </div>);

}