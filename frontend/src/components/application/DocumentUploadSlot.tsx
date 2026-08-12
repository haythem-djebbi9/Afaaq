import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileIcon,
  Loader2Icon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon } from
'lucide-react';
import { useLocale } from '../../contexts/LocaleContext';
import { useApplicationWizard } from '../../stores/applicationWizardStore';
import type { DocumentRequirement } from '../../lib/applicationsApi';

const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPTED_EXT = '.pdf,.jpg,.jpeg,.png';
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface Props {
  requirement: DocumentRequirement;
}

export function DocumentUploadSlot({ requirement }: Props) {
  const { t } = useLocale();
  const document = useApplicationWizard((s) => s.documents[requirement.type]);
  const upload = useApplicationWizard((s) => s.uploads[requirement.type]);
  const uploadFile = useApplicationWizard((s) => s.uploadFile);
  const removeDocument = useApplicationWizard((s) => s.removeDocument);

  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const lastFileRef = useRef<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = !!upload && upload.progress < 100 && !upload.error;
  const errorMessage = localError ?? upload?.error ?? null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateAndUpload = (file: File) => {
    setLocalError(null);
    if (!ACCEPTED_MIME.includes(file.type)) {
      setLocalError(t('doc.invalidFormat'));
      return;
    }
    if (file.size > MAX_SIZE) {
      setLocalError(t('doc.tooLarge'));
      return;
    }

    lastFileRef.current = file;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    void uploadFile(requirement.type, file);
  };

  const handleRetry = () => {
    if (lastFileRef.current) {
      setLocalError(null);
      void uploadFile(requirement.type, lastFileRef.current);
    } else {
      inputRef.current?.click();
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateAndUpload(file);
  };

  return (
    <div className="rounded-card border border-ink-200/70 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-bold text-ink-900">{t(requirement.labelKey)}</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            requirement.required ?
            'bg-afaaq-gold-50 text-afaaq-gold-600' :
            'bg-surface text-ink-500'}`
            }>
            {requirement.required ? t('form.required') : t('form.optional')}
          </span>
        </div>
      </div>

      <div className="mt-4">
        {document && !isUploading && !errorMessage ?
        <div className="flex items-center gap-3 rounded-[10px] border border-emerald-200 bg-emerald-50/50 p-3">
            {previewUrl ?
          <img src={previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-[8px] object-cover" /> :

          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-white text-ink-500">
                <FileIcon className="h-5 w-5" aria-hidden="true" />
              </span>
          }
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-ink-900">{document.originalName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-600">
                <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {t('doc.uploaded')} · {formatSize(document.size)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-white hover:text-afaaq-blue"
              aria-label={t('doc.replace')}
              title={t('doc.replace')}>
                <RefreshCwIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
              type="button"
              onClick={() => removeDocument(requirement.type)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-white hover:text-red-600"
              aria-label={t('form.remove')}
              title={t('form.remove')}>
                <Trash2Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div> :
        isUploading ?
        <div className="rounded-[10px] border border-ink-200 bg-surface p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-afaaq-blue">
              <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('doc.uploading')}… {upload?.progress ?? 0}%
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
              <motion.div
              className="h-full rounded-full bg-afaaq-blue"
              animate={{ width: `${upload?.progress ?? 0}%` }}
              transition={{ duration: 0.2 }} />
            </div>
          </div> :

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed p-6 text-center transition-colors ${
          errorMessage ?
          'border-red-300 bg-red-50/50' :
          dragActive ?
          'border-afaaq-blue bg-afaaq-blue-50' :
          'border-ink-200 hover:border-afaaq-blue/40 hover:bg-surface'}`
          }>
            <UploadCloudIcon
            className={`h-6 w-6 ${errorMessage ? 'text-red-500' : 'text-ink-500'}`}
            aria-hidden="true" />
            <span className="text-xs font-semibold text-ink-700">{t('doc.drop')}</span>
            <span className="text-[11px] text-ink-500">{t('doc.browse')}</span>
          </button>
        }

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndUpload(file);
            e.target.value = '';
          }} />


        <AnimatePresence initial={false}>
          {errorMessage &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
              <div className="mt-3 flex items-start justify-between gap-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5">
                <span className="flex items-start gap-2 text-[12px] font-medium text-red-700">
                  <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {errorMessage}
                </span>
                <button
                type="button"
                onClick={handleRetry}
                className="shrink-0 text-[12px] font-semibold text-red-700 underline-offset-2 hover:underline">
                  {t('doc.retry')}
                </button>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}
