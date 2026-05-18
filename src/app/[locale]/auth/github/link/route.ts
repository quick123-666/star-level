import { createClient } from '@/lib/supabase/server'
import { buildAuthCallbackUrl } from '@/lib/auth-oauth'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params
  const origin = new URL(request.url).origin
  const bindPath = `/${locale}/bind-github`

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/${locale}/login`)
  }

  const redirectTo = buildAuthCallbackUrl(origin, locale, bindPath)

  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'github',
    options: {
      redirectTo,
      scopes: 'read:user',
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    const url = new URL(`${origin}${bindPath}`)
    url.searchParams.set('error', error.message)
    return NextResponse.redirect(url)
  }

  if (data?.url) {
    return NextResponse.redirect(data.url)
  }

  const url = new URL(`${origin}${bindPath}`)
  url.searchParams.set('error', 'No OAuth redirect URL returned')
  return NextResponse.redirect(url)
}
