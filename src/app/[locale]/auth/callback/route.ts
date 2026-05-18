import { createClient } from '@/lib/supabase/server'
import { ensureGithubAccountRow } from '@/lib/github-account'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  context: { params: Promise<{ locale: string }> }
) {
  const { locale } = await context.params
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? `/${locale}/dashboard`

  if (!next.startsWith(`/${locale}`)) {
    const pathOnly = next.startsWith('/') ? next : `/${next}`
    next = `/${locale}${pathOnly === '/' ? '/dashboard' : pathOnly}`
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await ensureGithubAccountRow(supabase, user)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`)
}
