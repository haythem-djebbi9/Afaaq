import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, XIcon } from 'lucide-react';
import { AppHeader } from '@/shared/components/AppHeader';
import { DynamicReview } from '@/features/applications/components/DynamicReview';
import { DynamicStep } from '@/features/applications/components/DynamicStep';
import { PaymentStep } from '@/features/applications/components/PaymentStep';
import { ProgressBar, Stepper } from '@/features/applications/components/Stepper';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countries, services } from '@/shared/data/services';
import { stepInitialData } from '@/features/applications/stepDataMapping';
import { useApplicationWizard } from '@/features/applications/applicationWizardStore';
import type { CountryCode, ServiceId } from '@/shared/types';

const FORM_ID = 'dynamic-step-form';

export function Application() {
  const { t, lang, dir } = useLocale();
  const navigate = useNavigate();
  const params = useParams<{serviceId: string;}>();
  const [searchParams, setSearchParams] = useSearchParams();

  const config = useApplicationWizard((s) => s.config);
  const stepData = useApplicationWizard((s) => s.stepData);
  const requirements = useApplicationWizard((s) => s.requirements);
  const documents = useApplicationWizard((s) => s.documents);
  const status = useApplicationWizard((s) => s.status);
  const paymentStatus = useApplicationWizard((s) => s.paymentStatus);
  const startingCheckout = useApplicationWizard((s) => s.startingCheckout);
  const checkoutError = useApplicationWizard((s) => s.checkoutError);
  const loading = useApplicationWizard((s) => s.loading);
  const loadError = useApplicationWizard((s) => s.loadError);
  const saving = useApplicationWizard((s) => s.saving);
  const savedAt = useApplicationWizard((s) => s.savedAt);
  const submitting = useApplicationWizard((s) => s.submitting);
  const submitError = useApplicationWizard((s) => s.submitError);
  const missingOnSubmit = useApplicationWizard((s) => s.missingOnSubmit);
  const createApplication = useApplicationWizard((s) => s.createApplication);
  const loadApplication = useApplicationWizard((s) => s.loadApplication);
  const saveStep = useApplicationWizard((s) => s.saveStep);
  const startCheckout = useApplicationWizard((s) => s.startCheckout);
  const refreshPaymentStatus = useApplicationWizard((s) => s.refreshPaymentStatus);
  const submit = useApplicationWizard((s) => s.submit);
  const reset = useApplicationWizard((s) => s.reset);

  const [current, setCurrent] = useState(0);
  const [declared, setDeclared] = useState(false);

  const serviceId = params.serviceId as ServiceId || 'visa';
  const country = (searchParams.get('country') as CountryCode) || 'DE';
  const applicationId = searchParams.get('id');

  useEffect(() => {
    if (applicationId) {
      void loadApplication(applicationId);
      return;
    }
    void (async () => {
      const id = await createApplication(serviceId, country);
      if (id) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set('id', id);
          return next;
        }, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  useEffect(() => {
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const payment = searchParams.get('payment');
    if (!payment || !config) return;

    void refreshPaymentStatus();
    const paymentStepIndex = config.steps.findIndex((s) => s.kind === 'payment');
    if (paymentStepIndex >= 0) setCurrent(paymentStepIndex);

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('payment');
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const service = services.find((s) => s.id === serviceId) || services[0];
  const target = countries.find((c) => c.code === country) || countries[0];

  const goTo = (index: number) => {
    if (!config) return;
    setCurrent(Math.min(Math.max(index, 0), config.steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const missingLabels = missingOnSubmit.
  map((type) => requirements.find((r) => r.type === type)?.labelKey).
  filter((key): key is string => !!key);

  if (status === 'SUBMITTED') {
    return (
      <div className="min-h-screen w-full bg-surface">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-shell justify-center px-6 py-20">
          <Card className="max-w-lg p-10 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2Icon className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
              {t(service.titleKey)} — {target.name[lang]}
            </h1>
            <p className="mt-3 text-sm leading-6 text-ink-500">{t('review.subtitle')}</p>
            <div className="mt-8">
              <Button fullWidth onClick={() => navigate('/services')}>
                {t('form.exit')}
              </Button>
            </div>
          </Card>
        </main>
      </div>);

  }

  if (loading || !config) {
    return (
      <div className="min-h-screen w-full bg-surface">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-shell justify-center px-6 py-20">
          {loadError &&
          <p className="text-sm font-medium text-red-600">{t(loadError)}</p>
          }
        </main>
      </div>);

  }

  const steps = config.steps;
  const activeStep = steps[current];

  const handleStepSubmit = async (formData: Record<string, unknown>) => {
    if (activeStep.kind === 'fields') {
      await saveStep(activeStep, formData);
    }
    goTo(current + 1);
  };

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />

      <div className="sticky top-[72px] z-20 border-b border-ink-200/70 bg-white">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:px-10">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold text-ink-900">
                {t(service.titleKey)}
                <span className="ms-2 text-sm font-medium text-ink-500">
                  <span aria-hidden="true">{target.flag}</span> {target.name[lang]}
                </span>
              </h1>
            </div>
            <Link
              to="/services"
              className="ms-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface hover:text-afaaq-blue lg:hidden"
              aria-label={t('form.exit')}>

              <XIcon className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="lg:ms-auto lg:w-[420px]">
            <ProgressBar current={current} total={steps.length} />
          </div>
          <Link
            to="/services"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-surface hover:text-afaaq-blue lg:inline-flex"
            aria-label={t('form.exit')}>

            <XIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-shell grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[260px_1fr] lg:px-10">
        <aside className="hidden lg:sticky lg:top-[188px] lg:block lg:self-start">
          <Card className="p-6">
            <Stepper
              steps={steps.map((s) => ({ id: s.id, labelKey: s.titleKey }))}
              current={current}
              onSelect={goTo} />

          </Card>
        </aside>

        <section>
          <Card className="p-8">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}>

                {activeStep.kind === 'review' ?
                <DynamicReview
                  service={serviceId}
                  country={country}
                  config={config}
                  stepData={stepData}
                  requirements={requirements}
                  documents={documents}
                  paymentStatus={paymentStatus}
                  onEdit={goTo}
                  declared={declared}
                  onDeclare={setDeclared}
                  missingLabels={missingLabels}
                  submitError={submitError}
                  submitting={submitting}
                  onSubmit={() => void submit()} /> :
                activeStep.kind === 'payment' ?
                <PaymentStep
                  paymentStatus={paymentStatus}
                  starting={startingCheckout}
                  error={checkoutError}
                  onPay={() => void startCheckout()} /> :


                <DynamicStep
                  step={activeStep}
                  data={stepInitialData(activeStep, stepData)}
                  documents={
                  activeStep.id === 'passport' ?
                  requirements.filter((r) => r.step === 2) :
                  activeStep.kind === 'documents' ?
                  requirements.filter((r) => r.step === 8) :
                  undefined
                  }
                  onSubmit={(data) => void handleStepSubmit(data)}
                  formId={FORM_ID} />

                }
            </motion.div>

            {activeStep.kind !== 'review' &&
            <div className="mt-10 flex flex-col gap-3 border-t border-ink-200/70 pt-6 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                variant="ghost"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
                fullWidth
                className="sm:w-auto">
                  <ArrowLeftIcon
                  className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                  aria-hidden="true" />

                  {t('form.back')}
                </Button>

                {saving &&
              <span className="text-center text-xs text-ink-500 sm:ms-auto sm:text-start">
                    {t('newapp.submitting')}
                  </span>
              }
                {!saving && savedAt &&
              <span className="text-center text-xs text-emerald-600 sm:ms-auto sm:text-start">
                    {t('form.saved')}
                  </span>
              }

                <div className="flex flex-col gap-3 sm:ms-auto sm:flex-row sm:items-center">
                  {activeStep.kind === 'payment' ?
                <Button
                  onClick={() => goTo(current + 1)}
                  disabled={paymentStatus !== 'PAID'}
                  fullWidth
                  className="sm:w-auto">

                      {t('form.next')}
                      <ArrowRightIcon
                    className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                    aria-hidden="true" />

                    </Button> :

                <Button type="submit" form={FORM_ID} fullWidth className="sm:w-auto">
                      {t('form.next')}
                      <ArrowRightIcon
                    className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`}
                    aria-hidden="true" />

                    </Button>
                }
                </div>
              </div>
            }
          </Card>
        </section>
      </main>
    </div>);

}
