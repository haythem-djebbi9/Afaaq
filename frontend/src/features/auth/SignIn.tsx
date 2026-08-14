import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '@/features/auth/AuthLayout';
import { Alert } from '@/shared/components/ui/Alert';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox, Input } from '@/shared/components/ui/Field';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { ApiError } from '@/shared/api/client';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export function SignIn() {
  const { t, dir } = useLocale();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState<{email?: boolean;password?: boolean;}>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailError = touched.email && !email ?
  t('auth.error.required') :
  touched.email && !EMAIL_RE.test(email) ?
  t('auth.error.email') :
  undefined;
  const passwordError = touched.password && !password ? t('auth.error.required') : undefined;

  const markTouched = (field: 'email' | 'password') => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setFormError(null);

    if (!EMAIL_RE.test(email) || !password) return;

    setSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      const redirectTo =
        loggedInUser.role === 'ADMIN' ?
        '/admin' :
        (location.state as {from?: string;} | null)?.from ?? '/services';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(
          err.code === 'invalid_credentials' ?
          t('auth.error.invalidCredentials') :
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
        <h1 className="font-display text-[28px] font-bold text-ink-900">{t('auth.signInTitle')}</h1>
        <p className="mt-2 text-sm text-ink-500">{t('auth.signInSubtitle')}</p>
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
            label={t('auth.email')}
            type="email"
            required
            autoComplete="email"
            placeholder="yassine@afaaq.tn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched('email')}
            error={emailError}
            valid={touched.email && !emailError && email.length > 0}
            icon={<MailIcon className="h-4 w-4" aria-hidden="true" />} />
        </motion.div>

        <motion.div variants={item}>
          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markTouched('password')}
            error={passwordError}
            icon={<LockIcon className="h-4 w-4" aria-hidden="true" />}
            trailing={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-ink-500 transition-colors hover:text-afaaq-blue"
              aria-label={t('auth.password')}>

              {showPassword ?
              <EyeOffIcon className="h-4 w-4" aria-hidden="true" /> :
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
              }
            </button>
            } />
        </motion.div>

        <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-3">
          <Checkbox id="remember" label={t('auth.remember')} defaultChecked />
          <a
            href="#reset"
            className="text-[13px] font-semibold text-afaaq-blue underline-offset-4 hover:underline">
            {t('auth.forgot')}
          </a>
        </motion.div>

        <motion.div variants={item}>
          <Button type="submit" size="lg" fullWidth disabled={submitting}>
            {submitting ?
            <>
                <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                {t('auth.signingIn')}
              </> :

            <>
                {t('auth.signIn')}
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
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className="font-semibold text-afaaq-blue underline-offset-4 hover:underline">
          {t('auth.signUp')}
        </Link>
      </motion.p>
    </AuthLayout>);

}
