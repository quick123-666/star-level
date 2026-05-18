'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ensureGithubAccountRow } from '@/lib/github-account'
import { SyncStarsButton } from '@/components/sync-stars-button'

const SUPABASE_AUTH_SETTINGS_URL =
  'https://supabase.com/dashboard/project/fkkeylzfdfpsudocydwz/auth/providers'

function isManualLinkingDisabled(message: string) {
  return /manual linking is disabled/i.test(message)
}

export default function BindGitHubPage() {
  const t = useTranslations('bindGitHub')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [linked, setLinked] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showManualLinkingHelp, setShowManualLinkingHelp] = useState(false)

  const linkHref = `/${locale}/auth/github/link`
  const signinHref = `/${locale}/auth/github/signin`

  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get('error')
    if (urlError) {
      if (isManualLinkingDisabled(urlError)) {
        setShowManualLinkingHelp(true)
      } else {
        setError(urlError)
      }
    }
    void initLinkedState()
  }, [])

  async function initLinkedState() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.identities?.some((i) => i.provider === 'github')) {
      await ensureGithubAccountRow(supabase, user)
    }

    const { data } = await supabase.rpc('my_progress')
    const progress = data as { has_github_linked?: boolean } | null
    setLinked(progress?.has_github_linked ?? false)
  }

  async function handleGitHubLogin() {
    await supabase.auth.signOut()
    window.location.href = signinHref
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-12">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t('subtitle')}</p>

      {linked === null ? (
        <p className="mt-8 text-sm text-zinc-400">{t('checking')}</p>
      ) : linked ? (
        <div className="mt-8 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            {t('linkedMessage')}
          </p>
          <SyncStarsButton onSynced={() => router.push('/dashboard')} />
          <Link href="/dashboard" className="inline-block text-sm font-medium underline">
            {t('goDashboard')}
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <a
            href={linkHref}
            className="flex w-full items-center justify-center rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            {t('connect')}
          </a>

          {showManualLinkingHelp && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {t('manualLinkingTitle')}
              </p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-amber-800 dark:text-amber-200">
                <li>{t('manualLinkingStep1')}</li>
                <li>{t('manualLinkingStep2')}</li>
                <li>{t('manualLinkingStep3')}</li>
              </ol>
              <a
                href={SUPABASE_AUTH_SETTINGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-medium text-amber-900 underline dark:text-amber-100"
              >
                {t('openSupabaseSettings')}
              </a>
            </div>
          )}

          {error && !showManualLinkingHelp && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500">{t('orGitHubLogin')}</p>
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="mt-2 w-full rounded-lg border border-zinc-300 py-2.5 text-sm font-medium dark:border-zinc-700"
            >
              {t('githubLoginButton')}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-12 text-sm text-zinc-400 underline"
      >
        {tc('signOut')}
      </button>
    </main>
  )
}
