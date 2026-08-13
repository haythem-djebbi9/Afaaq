import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2Icon,
  CircleDashedIcon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  ShieldCheckIcon,
  XCircleIcon } from
'lucide-react';
import { AppHeader } from '@/shared/components/AppHeader';
import { FieldsSummary } from '@/features/applications/components/SectionSummary';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Checkbox, Textarea } from '@/shared/components/ui/Field';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countries, services } from '@/shared/data/services';
import {
  finalizeDossier,
  getApplicationDetail,
  reviewSection,
  type AdminApplicationDetail } from
'@/features/admin/admin.api';
import type { DocumentRecord } from '@/features/applications/applications.api';
import { stepInitialData } from '@/features/applications/stepDataMapping';
import { AdminDocumentsPanel } from '@/features/admin/AdminDocumentsPanel';

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

export function AdminCandidateDetailPage() {
  const { t, setLang } = useLocale();
  const { token } = useAuth();
  const params = useParams<{id: string;}>();

  const [detail, setDetail] = useState<AdminApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => {
    setLang('de');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (!token || !params.id) return;
    setLoading(true);
    const res = await getApplicationDetail(token, params.id);
    setDetail(res);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, params.id]);

  if (loading || !detail) {
    return (
      <div className="min-h-screen w-full bg-surface">
        <AppHeader />
        <main className="flex justify-center py-24">
          <Loader2Icon className="h-6 w-6 animate-spin text-afaaq-blue" aria-hidden="true" />
        </main>
      </div>);

  }

  const sections = detail.config.steps.filter((s) => s.kind !== 'review');
  const activeStep = sections[current];
  const documentsByType: Record<string, DocumentRecord> = Object.fromEntries(
    detail.documents.map((d) => [d.type, d])
  );
  const activeReview = detail.sectionReviews.find((r) => r.section === activeStep.id);
  const country = countries.find((c) => c.code === detail.country);
  const service = services.find((s) => s.id.toUpperCase() === detail.service);

  const handleReview = async (status: 'APPROVED' | 'NEEDS_CORRECTION') => {
    if (!token || !params.id) return;
    setSaving(true);
    await reviewSection(token, params.id, activeStep.id, {
      status,
      remark: status === 'NEEDS_CORRECTION' ? remark : undefined
    });
    setRemark('');
    await load();
    setSaving(false);
  };

  const handleFinalize = async () => {
    if (!token || !params.id) return;
    setFinalizing(true);
    setFinalizeError(null);
    try {
      await finalizeDossier(token, params.id);
      await load();
    } catch (err) {
      setFinalizeError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setFinalizing(false);
    }
  };

  const dossierValidated = detail.dossierReview?.status === 'VALIDATED';

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />

      <div className="sticky top-[72px] z-20 border-b border-ink-200/70 bg-white">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:px-10">
          <div>
            <Link to="/admin" className="text-xs font-semibold text-afaaq-blue hover:underline">
              ← {t('admin.candidates.title')}
            </Link>
            <h1 className="mt-1 font-display text-lg font-bold text-ink-900">{detail.user.fullName}</h1>
            <p className="text-xs text-ink-500">
              {detail.user.email} · {service ? t(service.titleKey) : detail.service} ·{' '}
              <span aria-hidden="true">{country?.flag}</span> {country?.name.de ?? detail.country}
            </p>
          </div>
          <div className="lg:ms-auto flex items-center gap-3">
            {dossierValidated ?
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                {t('admin.dossier.validated')}
              </span> :

            <Button onClick={() => void handleFinalize()} disabled={finalizing}>
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                {finalizing ? '…' : t('admin.dossier.finalize')}
              </Button>
            }
          </div>
        </div>
        {finalizeError &&
        <div className="mx-auto w-full max-w-shell px-6 pb-3 lg:px-10">
            <p className="text-xs font-medium text-red-600">{finalizeError}</p>
          </div>
        }
      </div>

      <main className="mx-auto grid w-full max-w-shell grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="lg:sticky lg:top-[164px] lg:block lg:self-start">
          <Card className="p-4">
            <nav>
              <ol className="flex flex-col gap-1">
                {sections.map((step, index) => {
                  const review = detail.sectionReviews.find((r) => r.section === step.id);
                  const Icon = STATUS_ICON[review?.status ?? 'PENDING'];
                  const active = index === current;
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setCurrent(index)}
                        className={`flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-start text-[13px] transition-colors ${
                        active ? 'bg-afaaq-blue-50 font-semibold text-afaaq-blue' : 'text-ink-700 hover:bg-surface'}`
                        }>

                        <Icon className={`h-4 w-4 shrink-0 ${STATUS_COLOR[review?.status ?? 'PENDING']}`} aria-hidden="true" />
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
              <Checkbox
                label={<span className="inline-flex items-center gap-1.5"><EyeIcon className="h-3.5 w-3.5" aria-hidden="true" />{t('admin.showOriginal')}</span>}
                checked={showOriginal}
                onChange={(e) => setShowOriginal(e.target.checked)} />

            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}>

                {activeStep.kind === 'fields' &&
                <FieldsSummary
                  step={activeStep}
                  data={stepInitialData(activeStep, detail.stepData)}
                  translations={detail.translations}
                  showOriginal={showOriginal} />

                }
                {activeStep.kind === 'fields' && activeStep.documents && activeStep.documents.length > 0 &&
                <div className="mt-6 border-t border-ink-200/70 pt-6">
                    <AdminDocumentsPanel
                    applicationId={detail.id}
                    requirements={detail.requirements.filter((r) => r.step === 2)}
                    documents={documentsByType} />

                  </div>
                }
                {activeStep.kind === 'documents' &&
                <AdminDocumentsPanel
                  applicationId={detail.id}
                  requirements={detail.requirements.filter((r) => r.step === 8)}
                  documents={documentsByType} />

                }
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 border-t border-ink-200/70 pt-6">
              {activeReview &&
              <div
                className={`mb-4 rounded-[10px] border px-4 py-3 text-sm ${
                activeReview.status === 'APPROVED' ?
                'border-emerald-200 bg-emerald-50 text-emerald-700' :
                activeReview.status === 'NEEDS_CORRECTION' ?
                'border-red-200 bg-red-50 text-red-700' :
                'border-ink-200 bg-surface text-ink-700'}`
                }>

                  <p className="font-semibold">
                    {t(`admin.status.${activeReview.status === 'NEEDS_CORRECTION' ? 'needsCorrection' : activeReview.status === 'APPROVED' ? 'approved' : 'pending'}`)}
                  </p>
                  {activeReview.remark && <p className="mt-1 text-xs">{activeReview.remark}</p>}
                </div>
              }

              <Textarea
                label={t('admin.remark.label')}
                hint={t('admin.remark.hint')}
                value={remark}
                onChange={(e) => setRemark(e.target.value)} />


              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="secondary" disabled={saving} onClick={() => void handleReview('NEEDS_CORRECTION')}>
                  <PencilIcon className="h-4 w-4" aria-hidden="true" />
                  {t('admin.action.needsCorrection')}
                </Button>
                <Button disabled={saving} onClick={() => void handleReview('APPROVED')}>
                  <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                  {t('admin.action.approve')}
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>);

}
