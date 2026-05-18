import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  getLocaleFromPathname,
  pathWithLocale,
  stripLocalePrefix,
} from '@/i18n/locale'

export async function updateSession(
  request: NextRequest,
  response: NextResponse = NextResponse.next({ request })
) {
  let supabaseResponse = response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const locale = getLocaleFromPathname(request.nextUrl.pathname)
  const path = stripLocalePrefix(request.nextUrl.pathname)

  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup')
  const isPublic = isAuthPage || path.startsWith('/auth')

  if (!user && !isPublic && path !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = pathWithLocale('/login', locale)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = pathWithLocale('/dashboard', locale)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
