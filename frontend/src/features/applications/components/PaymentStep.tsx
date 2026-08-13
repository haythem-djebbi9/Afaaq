import { CheckCircle2Icon, CreditCardIcon } from 'lucide-react';
import { StepShell } from '@/features/applications/components/StepShell';
import { Button } from '@/shared/components/ui/Button';
import { useLocale } from '@/shared/i18n/LocaleContext';
import type { PaymentStatus } from '@/features/applications/applications.api';

interface Props {
  paymentStatus: PaymentStatus | null;
  starting: boolean;
  error: string | null;
  onPay: () => void;
}

export function PaymentStep({ paymentStatus, starting, error, onPay }: Props) {
  const { t } = useLocale();
  const paid = paymentStatus === 'PAID';

  return (
    <StepShell title={t('step.payment')} hint={t('hint.payment')}>
      <div className="flex flex-col items-center gap-6 rounded-[10px] border border-ink-200 bg-surface/60 px-6 py-10 text-center">
        {paid ?
        <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2Icon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink-900">{t('payment.paidTitle')}</p>
              <p className="mt-2 text-sm text-ink-500">{t('payment.paidSubtitle')}</p>
            </div>
          </> :

        <>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-afaaq-blue-50 text-afaaq-blue">
              <CreditCardIcon className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-ink-900">{t('payment.title')}</p>
              <p className="mt-2 max-w-md text-sm text-ink-500">{t('payment.subtitle')}</p>
            </div>
            {error && <p className="text-sm font-medium text-red-600">{t(error)}</p>}
            <Button onClick={onPay} disabled={starting}>
              {starting ? t('payment.redirecting') : t('payment.payNow')}
            </Button>
          </>
        }
      </div>
    </StepShell>);

}
