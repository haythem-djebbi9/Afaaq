import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  AwardIcon,
  BriefcaseBusinessIcon,
  GraduationCapIcon,
  Loader2Icon,
  StampIcon } from
'lucide-react';
import { AppHeader } from '@/shared/components/AppHeader';
import { Button } from '@/shared/components/ui/Button';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countries, services } from '@/shared/data/services';
import { useApplicationWizard } from '@/features/applications/applicationWizardStore';
import type { CountryCode, ServiceId } from '@/shared/types';

const serviceIcons = {
  stamp: StampIcon,
  graduation: GraduationCapIcon,
  briefcase: BriefcaseBusinessIcon,
  certificate: AwardIcon
};

const serviceSchema = z.object({ service: z.enum(['visa', 'training', 'job', 'diploma']) });
const countrySchema = z.object({ country: z.enum(['DE', 'AT', 'IT', 'FR']) });

export function NewApplication() {
  const { t, lang, dir } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<0 | 1>(0);
  const [service, setService] = useState<ServiceId | null>(null);
  const [country, setCountry] = useState<CountryCode | null>(null);

  const creatingApplication = useApplicationWizard((s) => s.creatingApplication);
  const createError = useApplicationWizard((s) => s.createError);
  const createApplication = useApplicationWizard((s) => s.createApplication);
  const reset = useApplicationWizard((s) => s.reset);

  const serviceForm = useForm<z.infer<typeof serviceSchema>>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { service: (service ?? '') as ServiceId }
  });
  const countryForm = useForm<z.infer<typeof countrySchema>>({
    resolver: zodResolver(countrySchema),
    defaultValues: { country: (country ?? '') as CountryCode }
  });

  useEffect(() => {
    const qsService = searchParams.get('service') as ServiceId | null;
    const qsCountry = searchParams.get('country') as CountryCode | null;
    if (qsService && services.some((svc) => svc.id === qsService)) {
      setService(qsService);
      serviceForm.setValue('service', qsService);
    }
    if (qsCountry && countries.some((c) => c.code === qsCountry)) {
      setCountry(qsCountry);
      countryForm.setValue('country', qsCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const arrow = `h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`;
  const selectedService = services.find((s) => s.id === service);
  const availableCountries = selectedService ?
  countries.filter((c) => selectedService.countries.includes(c.code)) :
  countries;

  const handleStart = async () => {
    if (!service || !country) return;
    const applicationId = await createApplication(service, country);
    if (applicationId) {
      navigate(`/apply/${service}?country=${country}&id=${applicationId}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />

      <main className="mx-auto w-full max-w-3xl px-6 py-10 lg:px-10">
        <ol className="mb-10 flex items-center justify-center gap-4">
          {[t('newapp.stepService'), t('newapp.stepCountry')].map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <li key={label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                    done || active ?
                    'border-afaaq-blue bg-afaaq-blue text-white' :
                    'border-ink-200 bg-white text-ink-500'}`
                    }>
                    {index + 1}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${active ? 'text-afaaq-blue' : 'text-ink-500'}`}>
                    {label}
                  </span>
                </div>
                {index < 1 &&
                <span className={`mb-4 h-px w-16 ${done ? 'bg-afaaq-gold' : 'bg-ink-200'}`} aria-hidden="true" />
                }
              </li>);

          })}
        </ol>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}>

          {step === 0 &&
            <form onSubmit={serviceForm.handleSubmit(() => setStep(1))}>
                <h1 className="text-center font-display text-2xl font-bold text-ink-900">
                  {t('newapp.chooseService.title')}
                </h1>
                <p className="mt-2 text-center text-sm text-ink-500">{t('newapp.chooseService.subtitle')}</p>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {services.map((svc) => {
                  const Icon = serviceIcons[svc.icon];
                  const active = service === svc.id;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => {
                        setService(svc.id);
                        serviceForm.setValue('service', svc.id, { shouldValidate: true });
                      }}
                      aria-pressed={active}
                      className={`rounded-card border p-5 text-start transition-all ${
                      active ?
                      'border-afaaq-blue bg-afaaq-blue-50 shadow-card' :
                      'border-ink-200/70 bg-white hover:border-afaaq-blue/40'}`
                      }>

                        <span
                        className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${
                        active ? 'bg-afaaq-blue text-white' : 'bg-surface text-afaaq-blue'}`
                        }>
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <h3 className="mt-3 font-display text-sm font-bold text-ink-900">{t(svc.titleKey)}</h3>
                        <p className="mt-1.5 text-xs leading-5 text-ink-500">{t(svc.descKey)}</p>
                      </button>);

                })}
                </div>

                {serviceForm.formState.errors.service &&
              <p className="mt-4 text-center text-xs font-medium text-red-600">{t('newapp.selectRequired')}</p>
              }

                <div className="mt-8 flex justify-center">
                  <Button type="submit" size="lg">
                    {t('form.next')}
                    <ArrowRightIcon className={arrow} aria-hidden="true" />
                  </Button>
                </div>
              </form>
            }

            {step === 1 &&
            <form onSubmit={countryForm.handleSubmit(() => void handleStart())}>
                <h1 className="text-center font-display text-2xl font-bold text-ink-900">
                  {t('newapp.chooseCountry.title')}
                </h1>
                <p className="mt-2 text-center text-sm text-ink-500">{t('newapp.chooseCountry.subtitle')}</p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {availableCountries.map((c) => {
                  const active = country === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCountry(c.code);
                        countryForm.setValue('country', c.code, { shouldValidate: true });
                      }}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-2 rounded-card border p-5 transition-all ${
                      active ?
                      'border-afaaq-blue bg-afaaq-blue-50 shadow-card' :
                      'border-ink-200/70 bg-white hover:border-afaaq-blue/40'}`
                      }>

                        <span className="text-3xl" aria-hidden="true">{c.flag}</span>
                        <span className="text-xs font-semibold text-ink-900">{c.name[lang]}</span>
                      </button>);

                })}
                </div>

                {countryForm.formState.errors.country &&
              <p className="mt-4 text-center text-xs font-medium text-red-600">{t('newapp.selectRequired')}</p>
              }
                {createError &&
              <p className="mt-4 text-center text-xs font-medium text-red-600">{t(createError)}</p>
              }

                <div className="mt-8 flex justify-center gap-3">
                  <Button type="button" variant="ghost" onClick={() => setStep(0)}>
                    <ArrowLeftIcon className={arrow} aria-hidden="true" />
                    {t('form.back')}
                  </Button>
                  <Button type="submit" size="lg" disabled={creatingApplication}>
                    {creatingApplication ?
                  <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" /> :

                  <>
                        {t('form.next')}
                        <ArrowRightIcon className={arrow} aria-hidden="true" />
                      </>
                  }
                  </Button>
                </div>
              </form>
            }
        </motion.div>
      </main>
    </div>);

}
