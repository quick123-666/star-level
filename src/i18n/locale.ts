import { routing, type Locale } from './routing'

export function getLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split('/')[1]
  if (routing.locales.includes(segment as Locale)) {
    return segment as Locale
  }
  return routing.defaultLocale
}

export function stripLocalePrefix(pathname: string): string {
  const locale = pathname.split('/')[1]
  if (routing.locales.includes(locale as Locale)) {
    const rest = pathname.slice(locale.length + 1)
    return rest || '/'
  }
  return pathname
}

export function pathWithLocale(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === '/') return `/${locale}`
  return `/${locale}${normalized}`
}
