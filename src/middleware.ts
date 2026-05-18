import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

// Auth redirects live in server pages (dashboard, home). Keeping middleware
// intl-only avoids Edge runtime crashes with Supabase session refresh.
export default createIntlMiddleware(routing)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
