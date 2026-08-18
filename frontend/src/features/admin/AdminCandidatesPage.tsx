import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';
import { AppHeader } from '@/shared/components/AppHeader';
import { Card } from '@/shared/components/ui/Card';
import { Input, Select } from '@/shared/components/ui/Field';
import { useAuth } from '@/features/auth/AuthContext';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countries, services } from '@/shared/data/services';
import { listApplications, type AdminApplicationRow, type AdminListFilters } from '@/features/admin/admin.api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-surface text-ink-500',
  approved: 'bg-emerald-50 text-emerald-600',
  needs_correction: 'bg-red-50 text-red-600'
};

export function AdminCandidatesPage() {
  const { t, lang } = useLocale();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [rows, setRows] = useState<AdminApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminListFilters>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const handle = setTimeout(() => {
      void listApplications(token, { ...filters, search: search || undefined })
        .then(setRows)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(handle);
  }, [token, filters, search]);

  return (
    <div className="min-h-screen w-full bg-surface">
      <AppHeader />
      <main className="mx-auto w-full max-w-shell px-6 py-8 lg:px-10">
        <h1 className="font-display text-2xl font-bold text-ink-900">{t('admin.candidates.title')}</h1>
        <p className="mt-1 text-sm text-ink-500">{t('admin.candidates.subtitle')}</p>

        <Card className="mt-6 p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Input
              label={t('admin.filter.search')}
              icon={<SearchIcon className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)} />

            <Select
              label={t('admin.filter.status')}
              placeholder={t('admin.filter.all')}
              value={filters.status ?? ''}
              onChange={(e) =>
              setFilters((f) => ({ ...f, status: (e.target.value || undefined) as AdminListFilters['status'] }))
              }
              options={[
              { value: 'pending', label: t('admin.status.pending') },
              { value: 'approved', label: t('admin.status.approved') },
              { value: 'needs_correction', label: t('admin.status.needsCorrection') }]
              } />

            <Select
              label={t('admin.filter.service')}
              placeholder={t('admin.filter.all')}
              value={filters.service ?? ''}
              onChange={(e) =>
              setFilters((f) => ({ ...f, service: (e.target.value || undefined) as AdminListFilters['service'] }))
              }
              options={services.map((s) => ({ value: s.id.toUpperCase(), label: t(s.titleKey) }))} />

            <Select
              label={t('admin.filter.country')}
              placeholder={t('admin.filter.all')}
              value={filters.country ?? ''}
              onChange={(e) =>
              setFilters((f) => ({ ...f, country: (e.target.value || undefined) as AdminListFilters['country'] }))
              }
              options={countries.map((c) => ({ value: c.code, label: c.name[lang] }))} />

            <Input
              label={t('admin.filter.dateFrom')}
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value || undefined }))} />

          </div>
        </Card>

        {!loading && rows.length === 0 &&
        <Card className="mt-6 p-10 text-center text-sm text-ink-500">{t('admin.candidates.empty')}</Card>
        }

        {rows.length > 0 &&
        <>
            {/* Mobile: one card per candidate — a 6-column table has no usable mobile layout. */}
            <div className="mt-6 flex flex-col gap-3 sm:hidden">
              {rows.map((row) => {
              const country = countries.find((c) => c.code === row.country);
              const service = services.find((s) => s.id.toUpperCase() === row.service);
              return (
                <Card
                  key={row.id}
                  onClick={() => navigate(`/admin/${row.id}`)}
                  className="cursor-pointer p-4 active:bg-surface">

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-900">{row.fullName}</p>
                        <p className="truncate text-xs text-ink-500">{row.email}</p>
                      </div>
                      <span
                      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[row.reviewStatus]}`}>

                        {t(`admin.status.${row.reviewStatus === 'needs_correction' ? 'needsCorrection' : row.reviewStatus}`)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <p className="text-ink-500">{t('admin.col.service')}</p>
                        <p className="mt-0.5 text-ink-700">{service ? t(service.titleKey) : row.service}</p>
                      </div>
                      <div>
                        <p className="text-ink-500">{t('admin.col.country')}</p>
                        <p className="mt-0.5 text-ink-700">
                          <span aria-hidden="true">{country?.flag}</span> {country?.name[lang] ?? row.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-ink-500">{t('admin.col.completion')}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-ink-200">
                            <div className="h-full rounded-full bg-afaaq-gold" style={{ width: `${row.completion}%` }} />
                          </div>
                          <span className="font-semibold text-ink-700">{row.completion}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-ink-500">{t('admin.col.date')}</p>
                        <p className="mt-0.5 text-ink-700">{new Date(row.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>);

            })}
            </div>

            {/* Desktop/tablet: full table. */}
            <Card className="mt-6 hidden overflow-x-auto p-0 sm:block">
              <table className="w-full text-start text-sm">
                <thead>
                  <tr className="border-b border-ink-200/70 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    <th className="px-5 py-3 text-start">{t('admin.col.candidate')}</th>
                    <th className="px-5 py-3 text-start">{t('admin.col.service')}</th>
                    <th className="px-5 py-3 text-start">{t('admin.col.country')}</th>
                    <th className="px-5 py-3 text-start">{t('admin.col.status')}</th>
                    <th className="px-5 py-3 text-start">{t('admin.col.completion')}</th>
                    <th className="px-5 py-3 text-start">{t('admin.col.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                  const country = countries.find((c) => c.code === row.country);
                  const service = services.find((s) => s.id.toUpperCase() === row.service);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => navigate(`/admin/${row.id}`)}
                      className="cursor-pointer border-b border-ink-200/50 transition-colors last:border-b-0 hover:bg-surface">

                        <td className="px-5 py-4">
                          <p className="font-medium text-ink-900">{row.fullName}</p>
                          <p className="text-xs text-ink-500">{row.email}</p>
                        </td>
                        <td className="px-5 py-4 text-ink-700">{service ? t(service.titleKey) : row.service}</td>
                        <td className="px-5 py-4 text-ink-700">
                          <span aria-hidden="true">{country?.flag}</span> {country?.name[lang] ?? row.country}
                        </td>
                        <td className="px-5 py-4">
                          <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[row.reviewStatus]}`}>

                            {t(`admin.status.${row.reviewStatus === 'needs_correction' ? 'needsCorrection' : row.reviewStatus}`)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-200">
                              <div
                              className="h-full rounded-full bg-afaaq-gold"
                              style={{ width: `${row.completion}%` }} />

                            </div>
                            <span className="text-xs font-semibold text-ink-700">{row.completion}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-ink-500">
                          {new Date(row.createdAt).toLocaleDateString()}
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </Card>
          </>
        }
      </main>
    </div>);

}
