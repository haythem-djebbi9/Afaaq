import React, { useState } from 'react';
import { CheckCircle2Icon, CircleDashedIcon, FileSearchIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { extractDocument } from '../../lib/adminApi';
import type { DocumentRecord, DocumentRequirement } from '../../lib/applicationsApi';

interface Props {
  applicationId: string;
  requirements: DocumentRequirement[];
  documents: Record<string, DocumentRecord>;
}

function DocumentExtractPanel({ applicationId, documentId }: {applicationId: string;documentId: string;}) {
  const { t } = useLocale();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{original: string;translatedDe: string;} | null>(null);
  const [error, setError] = useState(false);

  const handleExtract = async () => {
    if (!token || loading) return;
    setLoading(true);
    setError(false);
    try {
      const res = await extractDocument(token, applicationId, documentId);
      setResult(res);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      {!result &&
      <button
        type="button"
        onClick={() => void handleExtract()}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-afaaq-blue hover:underline disabled:opacity-50">

          {loading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <FileSearchIcon className="h-3.5 w-3.5" aria-hidden="true" />}
          {t('admin.doc.extract')}
        </button>
      }
      {error &&
      <p className="mt-1 text-xs text-red-600">{t('admin.doc.extractError')}</p>
      }
      {result &&
      <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-[10px] border border-ink-200 bg-surface/60 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-500">{t('admin.doc.original')}</p>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-ink-700">{result.original}</p>
          </div>
          <div className="rounded-[10px] border border-afaaq-blue/20 bg-afaaq-blue-50/40 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-afaaq-blue">{t('admin.doc.translatedDe')}</p>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-xs text-ink-900">{result.translatedDe}</p>
          </div>
        </div>
      }
    </div>);

}

export function AdminDocumentsPanel({ applicationId, requirements, documents }: Props) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      {requirements.map((req) => {
        const doc = documents[req.type];
        return (
          <div key={req.type} className="rounded-[10px] border border-ink-200/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink-700">{t(req.labelKey)}</span>
              {doc ?
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('doc.uploaded')}
                </span> :

              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                  <CircleDashedIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {req.required ? t('doc.missing') : t('form.optional')}
                </span>
              }
            </div>
            {doc && <DocumentExtractPanel applicationId={applicationId} documentId={doc.id} />}
          </div>);

      })}
    </div>);

}
