import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  getLocaleFromPathname,
  pathWithLocale,
  stripLocalePrefix,
} from '@/i18n/locale'

function copyIntlHeaders(from: NextResponse, to: NextResponse) {
  from.headers.forEach((value, key) => {
    to.headers.set(key, value)
  })
}

export async function updateSession(
  request: NextRequest,
  intlResponse: NextResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlResponse
  }

  let supabaseResponse = NextResponse.next({ request })
  copyIntlHeaders(intlResponse, supabaseResponse)

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          copyIntlHeaders(intlResponse, supabaseResponse)
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

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
  } catch {
    return intlResponse
  }
}
