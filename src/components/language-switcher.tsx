'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

export function LanguageSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: Locale) {
    if (next === locale) return
    router.replace(pathname, { locale: next })
    router.refresh()
  }

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/90 p-1 text-xs shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/90"
      role="group"
      aria-label={t('language')}
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => switchLocale(loc)}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            locale === loc
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          {loc === 'zh' ? t('chinese') : t('english')}
        </button>
      ))}
    </div>
  )
}
