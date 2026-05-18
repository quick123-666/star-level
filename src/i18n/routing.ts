import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'zh',
  localePrefix: 'always',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
