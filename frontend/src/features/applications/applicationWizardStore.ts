import { create } from 'zustand';
import { getStoredToken } from '@/shared/api/client';
import * as api from '@/features/applications/applications.api';
import { MissingDocumentsError } from '@/features/applications/applications.api';
import { fetchFormConfig } from '@/features/applications/formConfig.api';
import { stepPatchPayload } from '@/features/applications/stepDataMapping';
import type { CountryCode, ServiceId } from '@/shared/types';
import type { FormConfig, StepConfig } from '@/shared/types/formConfig';

export const SERVICE_TO_BACKEND: Record<ServiceId, api.BackendServiceType> = {
  visa: 'VISA',
  training: 'TRAINING',
  job: 'JOB',
  diploma: 'DIPLOMA'
};

interface UploadSlotState {
  progress: number;
  error: string | null;
}

interface WizardState {
  service: ServiceId | null;
  country: CountryCode | null;
  applicationId: string | null;
  status: api.ApplicationStatus | null;
  paymentStatus: api.PaymentStatus | null;
  startingCheckout: boolean;
  checkoutError: string | null;
  requirements: api.DocumentRequirement[];
  documents: Record<string, api.DocumentRecord>;
  uploads: Record<string, UploadSlotState>;
  config: FormConfig | null;
  stepData: Record<string, unknown>;

  loading: boolean;
  loadError: string | null;
  creatingApplication: boolean;
  createError: string | null;
  saving: boolean;
  savedAt: number | null;
  submitting: boolean;
  submitError: string | null;
  missingOnSubmit: string[];

  createApplication: (service: ServiceId, country: CountryCode) => Promise<string | null>;
  loadApplication: (id: string) => Promise<boolean>;
  saveStep: (step: StepConfig, formData: Record<string, unknown>) => Promise<boolean>;
  uploadFile: (type: string, file: File) => Promise<void>;
  removeDocument: (type: string) => Promise<void>;
  startCheckout: () => Promise<void>;
  refreshPaymentStatus: () => Promise<void>;
  submit: () => Promise<boolean>;
  reset: () => void;
}

const initialState = {
  service: null as ServiceId | null,
  country: null as CountryCode | null,
  applicationId: null as string | null,
  status: null as api.ApplicationStatus | null,
  paymentStatus: null as api.PaymentStatus | null,
  startingCheckout: false,
  checkoutError: null as string | null,
  requirements: [] as api.DocumentRequirement[],
  documents: {} as Record<string, api.DocumentRecord>,
  uploads: {} as Record<string, UploadSlotState>,
  config: null as FormConfig | null,
  stepData: {} as Record<string, unknown>,

  loading: false,
  loadError: null as string | null,
  creatingApplication: false,
  createError: null as string | null,
  saving: false,
  savedAt: null as number | null,
  submitting: false,
  submitError: null as string | null,
  missingOnSubmit: [] as string[]
};

function hydrate(application: api.ApplicationRecord) {
  return {
    applicationId: application.id,
    status: application.status,
    paymentStatus: application.paymentStatus,
    requirements: application.requirements,
    documents: Object.fromEntries(application.documents.map((d) => [d.type, d])),
    stepData: {
      personal: application.personal ?? {},
      passport: application.passport ?? {},
      languages: application.languages ?? [],
      education: application.education ?? [],
      trainings: application.trainings ?? [],
      experience: application.experience ?? [],
      objective: application.objective ?? {}
    }
  };
}

const BACKEND_TO_SERVICE: Record<api.BackendServiceType, ServiceId> = {
  VISA: 'visa',
  TRAINING: 'training',
  JOB: 'job',
  DIPLOMA: 'diploma'
};

export const useApplicationWizard = create<WizardState>((set, get) => ({
  ...initialState,

  createApplication: async (service, country) => {
    const token = getStoredToken();
    if (!token) {
      set({ createError: 'auth.error.generic' });
      return null;
    }

    set({ creatingApplication: true, createError: null });
    try {
      const application = await api.createApplication(token, SERVICE_TO_BACKEND[service], country);
      const config = await fetchFormConfig(token, SERVICE_TO_BACKEND[service], country);
      set({
        service,
        country,
        config,
        ...hydrate(application),
        creatingApplication: false
      });
      return application.id;
    } catch {
      set({ creatingApplication: false, createError: 'auth.error.network' });
      return null;
    }
  },

  loadApplication: async (id) => {
    const token = getStoredToken();
    if (!token) {
      set({ loadError: 'auth.error.generic' });
      return false;
    }

    set({ loading: true, loadError: null });
    try {
      const application = await api.getApplication(token, id);
      const service = BACKEND_TO_SERVICE[application.service];
      const config = await fetchFormConfig(token, application.service, application.country);
      set({
        service,
        country: application.country,
        config,
        ...hydrate(application),
        loading: false
      });
      return true;
    } catch {
      set({ loading: false, loadError: 'auth.error.network' });
      return false;
    }
  },

  saveStep: async (step, formData) => {
    const { applicationId } = get();
    const token = getStoredToken();
    if (!applicationId || !token) return false;

    const payload = stepPatchPayload(step, formData);
    set({ saving: true });
    try {
      const application = await api.updateApplicationData(token, applicationId, payload);
      set({
        stepData: { ...get().stepData, ...payload },
        status: application.status,
        saving: false,
        savedAt: Date.now()
      });
      return true;
    } catch {
      set({ saving: false });
      return false;
    }
  },

  uploadFile: async (type, file) => {
    const { applicationId, documents } = get();
    const token = getStoredToken();
    if (!applicationId || !token) return;

    set((state) => ({ uploads: { ...state.uploads, [type]: { progress: 0, error: null } } }));

    const existing = documents[type];
    const onProgress = (percent: number) =>
    set((state) => ({ uploads: { ...state.uploads, [type]: { progress: percent, error: null } } }));

    try {
      const doc = existing ?
      await api.replaceDocument(token, applicationId, existing.id, type, file, { onProgress }) :
      await api.uploadDocument(token, applicationId, type, file, { onProgress });

      set((state) => ({
        documents: { ...state.documents, [type]: doc },
        uploads: { ...state.uploads, [type]: { progress: 100, error: null } }
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'auth.error.generic';
      set((state) => ({ uploads: { ...state.uploads, [type]: { progress: 0, error: message } } }));
    }
  },

  removeDocument: async (type) => {
    const { applicationId, documents } = get();
    const token = getStoredToken();
    const doc = documents[type];
    if (!applicationId || !token || !doc) return;

    try {
      await api.deleteDocument(token, applicationId, doc.id);
      set((state) => {
        const nextDocs = { ...state.documents };
        delete nextDocs[type];
        const nextUploads = { ...state.uploads };
        delete nextUploads[type];
        return { documents: nextDocs, uploads: nextUploads };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'auth.error.generic';
      set((state) => ({ uploads: { ...state.uploads, [type]: { progress: 0, error: message } } }));
    }
  },

  startCheckout: async () => {
    const { applicationId } = get();
    const token = getStoredToken();
    if (!applicationId || !token) return;

    set({ startingCheckout: true, checkoutError: null });
    try {
      const { url } = await api.createCheckoutSession(token, applicationId);
      window.location.href = url;
    } catch {
      set({ startingCheckout: false, checkoutError: 'auth.error.generic' });
    }
  },

  refreshPaymentStatus: async () => {
    const { applicationId } = get();
    const token = getStoredToken();
    if (!applicationId || !token) return;

    try {
      const application = await api.syncPaymentStatus(token, applicationId);
      set({ paymentStatus: application.paymentStatus, status: application.status });
    } catch {
      // Best-effort refresh — the user can retry from the payment step if this fails.
    }
  },

  submit: async () => {
    const { applicationId } = get();
    const token = getStoredToken();
    if (!applicationId || !token) return false;

    set({ submitting: true, submitError: null, missingOnSubmit: [] });
    try {
      const application = await api.submitApplication(token, applicationId);
      set({ submitting: false, status: application.status });
      return true;
    } catch (err) {
      if (err instanceof MissingDocumentsError) {
        set({ submitting: false, missingOnSubmit: err.missing });
      } else {
        set({ submitting: false, submitError: 'auth.error.generic' });
      }
      return false;
    }
  },

  reset: () => set({ ...initialState })
}));
