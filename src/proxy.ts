import createIntlMiddleware from 'next-intl/middleware'
import type { NextRequest } from 'next/server'
import { routing } from '@/i18n/routing'

// Auth redirects live in server pages (dashboard, home). Proxy is intl-only
// (no Supabase session refresh) to avoid Edge/runtime issues on Vercel.
const handleI18nRouting = createIntlMiddleware(routing)

export function proxy(request: NextRequest) {
  return handleI18nRouting(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
