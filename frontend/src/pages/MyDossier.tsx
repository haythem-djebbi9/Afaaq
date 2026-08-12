import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2Icon, CircleDashedIcon, Loader2Icon, PencilIcon, XCircleIcon } from 'lucide-react';
import { AppHeader } from '../components/AppHeader';
import { DocumentsSummary, FieldsSummary } from '../components/application/SectionSummary';
import { DynamicStep } from '../components/application/DynamicStep';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import { countries, services } from '../data/services';
import { listMyApplications, updateApplicationData, type ApplicationRecord } from '../lib/applicationsApi';
import { fetchFormConfig } from '../lib/formConfigApi';
import { getClientReview, resubmitSection, type ClientReview } from '../lib/reviewApi';
import { stepInitialData, stepPatchPayload } from '../lib/stepDataMapping';
import { useApplicationWizard } from '../stores/applicationWizardStore';
import type { FormConfig } from '../types/formConfig';

const STATUS_ICON = {
  APPROVED: CheckCircle2Icon,
  NEEDS_CORRECTION: XCircleIcon,
  PENDING: CircleDashedIcon
};

const STATUS_COLOR: Record<string, string> = {
  APPROVED: 'text-emerald-600',
  NEEDS_CORRECTION: 'text-red-600',
  PENDING: 'text-ink-500'
};

const STATUS_KEY: Record<string, string> = {
  APPROVED: 'approved',
  NEEDS_CORRECTION: 'needsCorrection',
  PENDING: 'pending'
};

export function MyDossier() {
  const { t, lang } = useLocale();
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [review, setReview] = useState<ClientReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const loadIntoWizardStore = useApplicationWizard((s) => s.loadApplication);

  useEffect(() => {
    if (!token) return;
    void listMyApplications(token).then((apps) => {
      setApplications(apps);
      const fromQuery = searchParams.get('application');
      const initial = (fromQuery && apps.some((a) => a.id === fromQuery) ? fromQuery : apps[0]?.id) ?? null;
      setSelectedId(initial);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const selected = applications.find((a) => a.id === selectedId) ?? null;

  useEffect(() => {
    if (!token || !selected) return;
    setLoading(true);
    setCurrent(0);
    setEditing(false);
    Promise.all([
      fetchFormConfig(token, selected.service, selected.country),
      getClientReview(token, selected.id)
    ]).then(([cfg, rev]) => {
      setConfig(cfg);
      setReview(rev);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedId]);

  const stepData = useMemo(
    () =>
    selected ?
    {
      personal: selected.personal,
      passport: selected.passport,
      languages: selected.languages,
      education: selected.education,
      trainings: selected.trainings,
      experience: selected.experience,
      objective: selected.objective
    } :
    {},
    [selected]
  );

  const country = countries.find((c) => c.code === selected?.country);
  const service = services.find((s) => s.id.toUpperCase() === selected?.service);
  const sections = config ? config.steps.filter((s) => s.kind !== 'review') : [];
  const activeStep = sections[current];
  const activeReview = review?.sections.find((r) => r.section === activeStep?.id);
  const documentsByType = Object.fromEntries((selected?.documents ?? []).map((d) => [d.type, d]));

  const remarkForLang = (r: typeof activeReview) => {
    if (!r) return null;
    if (lang === 'ar') return r.remarkAr ?? r.remarkFr ?? r.remark;
    if (lang === 'de') return r.remark ?? r.remarkFr;
    return r.remarkFr ?? r.remark;
  };

  const reload = async () => {
    if (!token || !selected) return;
    const [apps, rev] = await Promise.all([listMyApplications(token), getClientReview(token, selected.id)]);
    setApplications(apps);
    setReview(rev);
  };

  const handleEdit = async () => {
    if (!selected) return;
    await loadIntoWizardStore(selected.id);
    setEditing(true);
  };

  const handleResubmit = async (formData: Record<string, unknown>) => {
    if (!token || !selected || !activeStep) return;
    setSaving(true);
    const payload = stepPatchPayload(activeStep, formData);
    await updateApplicationData(token, selected.id, payload);
    await resubmitSection(token, selected.id, activeStep.id);
    await reload();
    setEditing(false);
    setSaving(false);
  };

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen w-full bg-surface">
        <AppHeader />
        <main className="flex justify-center py-24">
          <Loader2Icon className="h-6 w-6 animate-spin text-afaaq-blue" aria-hidden="true" />
        </main>
      </div>);

  }

  if (!selected) {
    return (
      <div className="min-h-screen w-full bg-surface">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-shell justify-center px-6 py-20">
          <Card className="max-w-md p-10 text-center">
            <p className="text-sm text-ink-500">{t('dossier.empty')}</p>
          </Card>
        </main>
      </div>);

  }

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />

      <div className="sticky top-[72px] z-20 border-b border-ink-200/70 bg-white">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:px-10">
          <div>
            <h1 className="font-display text-lg font-bold text-ink-900">
              {service ? t(service.titleKey) : selected.service}
              <span className="ms-2 text-sm font-medium text-ink-500">
                <span aria-hidden="true">{country?.flag}</span> {country?.name[lang] ?? selected.country}
              </span>
            </h1>
          </div>
          {applications.length > 1 &&
          <div className="lg:ms-auto lg:w-80">
              <Select
              label=""
              value={selected.id}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setSearchParams({ application: e.target.value });
              }}
              options={applications.map((a) => {
                const svc = services.find((s) => s.id.toUpperCase() === a.service);
                const ctry = countries.find((c) => c.code === a.country);
                return { value: a.id, label: `${svc ? t(svc.titleKey) : a.service} — ${ctry?.name[lang] ?? a.country}` };
              })} />

            </div>
          }
        </div>
      </div>

      {config &&
      <main className="mx-auto grid w-full max-w-shell grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[280px_1fr] lg:px-10">
          <aside className="lg:sticky lg:top-[164px] lg:block lg:self-start">
            <Card className="p-4">
              <nav>
                <ol className="flex flex-col gap-1">
                  {sections.map((step, index) => {
                  const r = review?.sections.find((sr) => sr.section === step.id);
                  const Icon = STATUS_ICON[r?.status ?? 'PENDING'];
                  const active = index === current;
                  return (
                    <li key={step.id}>
                        <button
                        type="button"
                        onClick={() => {
                          setCurrent(index);
                          setEditing(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-start text-[13px] transition-colors ${
                        active ? 'bg-afaaq-blue-50 font-semibold text-afaaq-blue' : 'text-ink-700 hover:bg-surface'}`
                        }>

                          <Icon className={`h-4 w-4 shrink-0 ${STATUS_COLOR[r?.status ?? 'PENDING']}`} aria-hidden="true" />
                          {t(step.titleKey)}
                        </button>
                      </li>);

                })}
                </ol>
              </nav>
            </Card>
          </aside>

          <section>
            <Card className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-ink-900">{t(activeStep.titleKey)}</h2>
                {activeReview &&
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeReview.status === 'APPROVED' ?
                'bg-emerald-50 text-emerald-600' :
                activeReview.status === 'NEEDS_CORRECTION' ?
                'bg-red-50 text-red-600' :
                'bg-surface text-ink-500'}`
                }>

                    {t(`admin.status.${STATUS_KEY[activeReview.status]}`)}
                  </span>
              }
              </div>

              {activeReview?.status === 'NEEDS_CORRECTION' && remarkForLang(activeReview) &&
            <div className="mb-6 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <p className="font-semibold">{t('dossier.remarkTitle')}</p>
                  <p className="mt-1">{remarkForLang(activeReview)}</p>
                </div>
            }

              <AnimatePresence mode="wait">
                <motion.div
                key={`${activeStep.id}-${editing}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}>

                  {editing ?
                <>
                      <DynamicStep
                    step={activeStep}
                    data={stepInitialData(activeStep, stepData)}
                    documents={
                    activeStep.id === 'passport' ?
                    (selected.requirements ?? []).filter((r) => r.step === 2) :
                    activeStep.kind === 'documents' ?
                    (selected.requirements ?? []).filter((r) => r.step === 8) :
                    undefined
                    }
                    onSubmit={(data) => void handleResubmit(data)}
                    formId="dossier-edit-form" />

                      <div className="mt-6 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setEditing(false)}>
                          {t('form.back')}
                        </Button>
                        <Button type="submit" form="dossier-edit-form" disabled={saving}>
                          {saving ? '…' : t('dossier.resubmit')}
                        </Button>
                      </div>
                    </> :

                <>
                      {activeStep.kind === 'fields' &&
                  <FieldsSummary step={activeStep} data={stepInitialData(activeStep, stepData)} />
                  }
                      {activeStep.kind === 'fields' && activeStep.documents && activeStep.documents.length > 0 &&
                  <div className="mt-4 border-t border-ink-200/70 pt-4">
                          <DocumentsSummary
                      requirements={(selected.requirements ?? []).filter((r) => r.step === 2)}
                      documents={documentsByType} />

                        </div>
                  }
                      {activeStep.kind === 'documents' &&
                  <DocumentsSummary
                    requirements={(selected.requirements ?? []).filter((r) => r.step === 8)}
                    documents={documentsByType} />

                  }

                      {activeReview?.status === 'NEEDS_CORRECTION' &&
                  <div className="mt-6">
                          <Button variant="secondary" onClick={() => void handleEdit()}>
                            <PencilIcon className="h-4 w-4" aria-hidden="true" />
                            {t('dossier.editSection')}
                          </Button>
                        </div>
                  }
                    </>
                }
                </motion.div>
              </AnimatePresence>
            </Card>
          </section>
        </main>
      }
    </div>);

}
