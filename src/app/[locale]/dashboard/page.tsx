import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from '@/i18n/navigation'
import { ProgressCard } from '@/components/progress-card'
import { DashboardActions } from '@/components/dashboard-actions'
import type { Locale } from '@/i18n/routing'
import type { MyProgress } from '@/types/database'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('dashboard')
  const tc = await getTranslations('common')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect({ href: '/login', locale: locale as Locale })
  }

  const { data: progressData } = await supabase.rpc('my_progress')
  const progress = (progressData ?? { authenticated: false }) as MyProgress

  if (!progress.has_github_linked) {
    redirect({ href: '/bind-github', locale: locale as Locale })
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{tc('appName')}</h1>
          <p className="text-sm text-zinc-500">{user!.email}</p>
        </div>
        <DashboardActions showSignOut />
      </header>

      <ProgressCard progress={progress} />

      <section className="mt-8 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="font-semibold">{t('syncTitle')}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t('syncDescription')}</p>
        <div className="mt-4">
          <DashboardActions />
        </div>
      </section>

      <section className="mt-8 text-sm text-zinc-500">
        <h3 className="font-medium text-zinc-700 dark:text-zinc-300">
          {t('rulesTitle')}
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>{t('ruleDailyCap')}</li>
          <li>{t('ruleReset')}</li>
          <li>{t('ruleMaxLevel')}</li>
        </ul>
      </section>
    </main>
  )
}
