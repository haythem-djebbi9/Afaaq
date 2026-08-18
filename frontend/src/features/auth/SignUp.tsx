import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, LockIcon, MailIcon, PhoneIcon, UserIcon } from 'lucide-react';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox, Input, Select } from '@/shared/components/ui/Field';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { residenceOptions } from '@/features/auth/formOptions';
import { ApiError } from '@/shared/api/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } }
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

function passwordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/(?=.*[A-Z])(?=.*\d)/.test(password)) score++;
  if (password.length >= 12 || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

interface Touched {
  fullName?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

export function SignUp() {
  const { t, lang, dir } = useLocale();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+216');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [residence, setResidence] = useState('TN');
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const fullNameError = touched.fullName && fullName.trim().length < 2 ? t('auth.error.required') : undefined;
  const emailError = touched.email && !email ?
  t('auth.error.required') :
  touched.email && !EMAIL_RE.test(email) ?
  t('auth.error.email') :
  undefined;
  const passwordError = touched.password && !PASSWORD_RE.test(password) ? t('auth.error.passwordWeak') : undefined;
  const confirmError = touched.confirmPassword && confirmPassword !== password ?
  t('auth.error.passwordMismatch') :
  undefined;

  const markTouched = (field: keyof Touched) => setTouched((prev) => ({ ...prev, [field]: true }));

  const isValid =
  fullName.trim().length >= 2 &&
  EMAIL_RE.test(email) &&
  PASSWORD_RE.test(password) &&
  confirmPassword === password &&
  accepted;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    setFormError(null);

    if (!isValid) return;

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email,
        password,
        phone: [phoneCode.trim(), phoneNumber.trim()].filter(Boolean).join(' ') || undefined,
        residence
      });
      navigate('/services', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.code === 'email_taken' ?
          t('auth.error.emailTaken') :
          err.code === 'network' ?
          t('auth.error.network') :
          t('auth.error.generic')
        );
      } else {
        setFormError(t('auth.error.generic'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
        <h1 className="font-display text-[28px] font-bold text-ink-900">{t('auth.signUpTitle')}</h1>
        <p className="mt-2 text-sm text-ink-500">{t('auth.signUpSubtitle')}</p>
      </motion.header>

      <Alert message={formError} />

      <motion.form
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate>

        <motion.div variants={item}>
          <Input
            label={t('auth.fullName')}
            required
            autoComplete="name"
            placeholder="Yassine Ben Salah"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => markTouched('fullName')}
            error={fullNameError}
            valid={touched.fullName && !fullNameError}
            icon={<UserIcon className="h-4 w-4" aria-hidden="true" />} />
        </motion.div>

        <motion.div variants={item}>
          <Input
            label={t('auth.email')}
            type="email"
            required
            autoComplete="email"
            placeholder="yassine@afaaq.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched('email')}
            error={emailError}
            valid={touched.email && !emailError}
            icon={<MailIcon className="h-4 w-4" aria-hidden="true" />} />
        </motion.div>

        <motion.div variants={item} className="flex gap-2">
          <div className="w-[104px] shrink-0">
            <Input
              label={t('auth.phoneCode')}
              type="tel"
              autoComplete="tel-country-code"
              placeholder="+216"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)} />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label={t('auth.phone')}
              type="tel"
              hint={t('form.optional')}
              autoComplete="tel-national"
              placeholder="22 000 000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              icon={<PhoneIcon className="h-4 w-4" aria-hidden="true" />} />
          </div>
        </motion.div>

        <motion.div variants={item}>
          <Input
            label={t('auth.password')}
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched('password')}
            error={passwordError}
            hint={passwordError ? undefined : t('auth.passwordHint')}
            icon={<LockIcon className="h-4 w-4" aria-hidden="true" />} />

          {password.length > 0 &&
          <div className="mt-2 flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((index) =>
            <span key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-ink-200">
                <motion.span
                initial={{ width: 0 }}
                animate={{ width: strength > index ? '100%' : 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`block h-full rounded-full ${
                strength <= 1 ? 'bg-red-400' : strength === 2 ? 'bg-afaaq-gold' : 'bg-emerald-500'}`
                } />
              </span>
            )}
          </div>
          }
        </motion.div>

        <motion.div variants={item}>
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() => markTouched('confirmPassword')}
            error={confirmError}
            valid={touched.confirmPassword && !confirmError && confirmPassword.length > 0}
            icon={<LockIcon className="h-4 w-4" aria-hidden="true" />} />
        </motion.div>

        <motion.div variants={item}>
          <Select
            label={t('auth.residence')}
            required
            value={residence}
            onChange={(e) => setResidence(e.target.value)}
            options={residenceOptions.map((option) => ({ value: option.value, label: option.label[lang] }))} />
        </motion.div>

        <motion.div variants={item}>
          <Checkbox
            id="terms"
            label={t('auth.terms')}
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)} />
        </motion.div>

        <motion.div variants={item}>
          <Button type="submit" size="lg" fullWidth disabled={!accepted || submitting}>
            {submitting ?
            <>
                <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                {t('auth.creatingAccount')}
              </> :

            <>
                {t('auth.createAccount')}
                <ArrowRightIcon className={`h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} aria-hidden="true" />
              </>
            }
          </Button>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-8 text-center text-sm text-ink-500">
        {t('auth.haveAccount')}{' '}
        <Link to="/signin" className="font-semibold text-afaaq-blue underline-offset-4 hover:underline">
          {t('auth.signIn')}
        </Link>
      </motion.p>
    </AuthLayout>);

}
