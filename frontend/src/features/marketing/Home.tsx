import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  AwardIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  GraduationCapIcon,
  QuoteIcon,
  StampIcon } from
'lucide-react';
import { MarketingFooter } from '@/features/marketing/MarketingFooter';
import { MarketingHeader } from '@/features/marketing/MarketingHeader';
import { AppPreview } from '@/features/marketing/components/AppPreview';
import { FaqAccordion } from '@/features/marketing/components/FaqAccordion';
import { HeroSection } from '@/features/marketing/components/HeroSection';
import { PartnersMarquee } from '@/features/marketing/components/PartnersMarquee';
import { SectionHeader } from '@/features/marketing/components/SectionHeader';
import { VideoShowcase } from '@/features/marketing/components/VideoShowcase';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { useLocale } from '@/shared/i18n/LocaleContext';
import { countryHighlights, howItWorks, stories } from '@/features/marketing/home.data';
import { countries, services } from '@/shared/data/services';

const serviceIcons = {
  stamp: StampIcon,
  graduation: GraduationCapIcon,
  briefcase: BriefcaseBusinessIcon,
  certificate: AwardIcon
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' }
};

export function Home() {
  const { t, lang, dir } = useLocale();
  const arrow = `h-4 w-4 ${dir === 'rtl' ? 'rotate-180' : ''}`;
  const productBullets = ['home.product.b1', 'home.product.b2', 'home.product.b3'];

  return (
    <div id="top" className="min-h-screen w-full bg-white">
      <MarketingHeader />
      <HeroSection />
      <PartnersMarquee />

      {/* Video story */}
      <section id="video" className="w-full bg-surface py-20 lg:py-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <VideoShowcase />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="w-full bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <SectionHeader
            eyebrow={t('nav.how')}
            title={t('home.how.title')}
            subtitle={t('home.how.subtitle')} />
          

          <ol className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <span
              className="absolute inset-x-0 top-[22px] hidden h-px bg-ink-200 lg:block"
              aria-hidden="true" />
            
            {howItWorks.map((step, index) =>
            <motion.li
              key={step.titleKey}
              {...fadeUp}
              transition={{ duration: 0.45, delay: index * 0.09 }}
              className="relative">
              
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-afaaq-gold font-display text-base font-extrabold text-afaaq-blue-900 ring-8 ring-white">
                  {index + 1}
                </span>
                <h3 className="mt-6 font-display text-base font-bold text-ink-900">{t(step.titleKey)}</h3>
                <p className="mt-2 text-[13px] leading-6 text-ink-500">{t(step.descKey)}</p>
              </motion.li>
            )}
          </ol>
        </div>
      </section>

      {/* Product preview */}
      <section className="w-full bg-afaaq-blue-900 py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-shell items-center gap-14 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <SectionHeader
              eyebrow={t('home.product.eyebrow')}
              title={t('home.product.title')}
              subtitle={t('home.product.desc')}
              tone="light" />
            
            <ul className="mt-8 flex flex-col gap-4">
              {productBullets.map((key, index) =>
              <motion.li
                key={key}
                {...fadeUp}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="flex items-start gap-3 text-sm text-white/85">
                
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-afaaq-gold text-afaaq-blue-900">
                    <CheckIcon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {t(key)}
                </motion.li>
              )}
            </ul>
            <Link to="/signup" className="mt-9 inline-block">
              <Button size="lg" variant="gold">
                {t('home.ctaPrimary')}
                <ArrowRightIcon className={arrow} aria-hidden="true" />
              </Button>
            </Link>
          </div>

          <AppPreview />
        </div>
      </section>

      {/* Services */}
      <section id="services" className="w-full bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <SectionHeader
            eyebrow={t('nav.services')}
            title={t('home.services.title')}
            subtitle={t('home.services.subtitle')} />
          

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((service, index) => {
              const Icon = serviceIcons[service.icon];
              return (
                <motion.article
                  key={service.id}
                  {...fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}>

                  <Card className="group relative h-full overflow-hidden p-8 hover:shadow-lift">
                    <span
                      className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-afaaq-gold transition-transform duration-300 group-hover:scale-x-100"
                      aria-hidden="true" />
                    
                    <div className="flex items-start gap-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-afaaq-blue text-white transition-transform duration-300 group-hover:-translate-y-1">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-ink-900">{t(service.titleKey)}</h3>
                        <p className="mt-2 text-sm leading-6 text-ink-500">{t(service.descKey)}</p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {service.countries.map((code) =>
                          <span
                            key={code}
                            className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-500">
                            
                              {countries.find((c) => c.code === code)!.flag}{' '}
                              {countries.find((c) => c.code === code)!.name[lang]}
                            </span>
                          )}
                        </div>
                        <Link
                          to="/signup"
                          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-afaaq-blue">
                          
                          {t('home.services.link')}
                          <ArrowRightIcon
                            className={`${arrow} transition-transform group-hover:translate-x-1`}
                            aria-hidden="true" />
                          
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.article>);

            })}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section id="countries" className="w-full bg-surface py-20 lg:py-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <SectionHeader
            eyebrow={t('nav.countries')}
            title={t('home.countries.title')}
            subtitle={t('home.countries.subtitle')} />
          

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {countryHighlights.map((item, index) => {
              const country = countries.find((c) => c.code === item.code)!;
              return (
                <motion.div
                  key={item.code}
                  {...fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
                  transition={{ duration: 0.45, delay: index * 0.07 }}>
                  <Card className="group h-full border-t-4 border-t-afaaq-gold p-7 hover:shadow-lift">
                    <motion.span
                      className="block text-4xl"
                      whileHover={{ scale: 1.2, rotate: -6 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      aria-hidden="true">
                      {country.flag}
                    </motion.span>
                    <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                      {country.name[lang]}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-ink-500">{t(item.descKey)}</p>
                  </Card>
                </motion.div>);

            })}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section id="stories" className="w-full bg-white py-20 lg:py-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <SectionHeader
            eyebrow={t('nav.stories')}
            title={t('home.stories.title')}
            subtitle={t('home.stories.subtitle')} />
          

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {stories.map((story, index) =>
            <motion.figure
              key={story.id}
              {...fadeUp}
              whileHover={{ y: -8, transition: { duration: 0.2, ease: 'easeOut' } }}
              transition={{ duration: 0.45, delay: index * 0.08 }}>
                <Card className="flex h-full flex-col p-8 hover:shadow-lift">
                  <motion.span
                    initial={{ rotate: -8, scale: 0.9 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.15 + index * 0.08 }}
                    className="inline-block">
                    <QuoteIcon className="h-8 w-8 text-afaaq-gold" aria-hidden="true" />
                  </motion.span>
                  <blockquote className="mt-5 flex-1 text-[15px] leading-7 text-ink-700">
                    {t(story.quoteKey)}
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-3 border-t border-ink-200/70 pt-5">
                    <img
                    src={story.avatar}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-afaaq-gold/40" />
                  
                    <span>
                      <span className="block font-display text-sm font-bold text-ink-900">{story.name}</span>
                      <span className="block text-xs text-ink-500">{story.role[lang]}</span>
                    </span>
                  </figcaption>
                </Card>
              </motion.figure>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full bg-surface py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-shell gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <SectionHeader title={t('home.faq.title')} subtitle={t('home.faq.subtitle')} />
          <FaqAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full bg-white pb-20 lg:pb-24">
        <div className="mx-auto w-full max-w-shell px-6 lg:px-10">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-card bg-afaaq-blue px-8 py-16 text-center sm:px-16">
            
            <div
              className="absolute -top-24 -start-16 h-64 w-64 rounded-full border-[40px] border-white/5"
              aria-hidden="true" />
            
            <div
              className="absolute -bottom-28 -end-10 h-72 w-72 rounded-full border-[44px] border-afaaq-gold/10"
              aria-hidden="true" />
            
            <h2 className="relative font-display text-[32px] font-bold text-white lg:text-[40px]">
              {t('home.cta.title')}
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-[15px] leading-7 text-white/75">
              {t('home.cta.desc')}
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="gold">
                  {t('home.ctaPrimary')}
                  <ArrowRightIcon className={arrow} aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/signin">
                <Button
                  size="lg"
                  variant="secondary"
                  className="!border-white/25 !bg-transparent !text-white hover:!border-white hover:!bg-white/10">
                  
                  {t('nav.signin')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingFooter />
    </div>);

}