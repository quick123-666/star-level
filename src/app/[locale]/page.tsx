import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: progress } = await supabase.rpc('my_progress')
      const p = progress as { has_github_linked?: boolean } | null | undefined
      if (p?.has_github_linked) {
        redirect(`/${locale}/dashboard`)
      }
      redirect(`/${locale}/bind-github`)
    }
  } catch {
    // Missing env or Supabase unreachable — still show public homepage.
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium text-emerald-600">{tc('appName')}</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{t('tagline')}</h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
        {t('description')}
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
        >
          {t('getStarted')}
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium dark:border-zinc-700"
        >
          {t('logIn')}
        </Link>
      </div>
    </main>
  )
}
