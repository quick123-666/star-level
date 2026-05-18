'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const t = useTranslations('signup')
  const tc = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const origin = window.location.origin
    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/${locale}/auth/callback?next=/${locale}/bind-github`,
      },
    })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    router.push('/bind-github')
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
      <p className="mt-2 text-sm text-zinc-500">{t('subtitle')}</p>

      <a
        href={`/${locale}/auth/github/signin`}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium dark:border-zinc-700"
      >
        {t('githubButton')}
      </a>

      <div className="relative my-6 text-center text-xs text-zinc-400">
        <span className="bg-white px-2 dark:bg-zinc-950">{t('orEmail')}</span>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <label className="block text-sm font-medium">
          {tc('email')}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="block text-sm font-medium">
          {t('passwordHint')}
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {loading ? t('submitting') : t('submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t('hasAccount')}{' '}
        <Link href="/login" className="font-medium underline">
          {t('logIn')}
        </Link>
      </p>
    </main>
  )
}
