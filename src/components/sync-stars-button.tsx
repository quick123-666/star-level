'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type SyncResult = {
  ok: boolean
  recognized?: number
  skipped?: number
  errors?: number
  message?: string
}

export function SyncStarsButton({ onSynced }: { onSynced?: () => void }) {
  const t = useTranslations('sync')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)

  async function handleSync() {
    setLoading(true)
    setResult(null)
    const supabase = createClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setResult({ ok: false, message: t('loginRequired') })
      setLoading(false)
      return
    }

    if (!session.provider_token) {
      setResult({ ok: false, message: t('githubRequired') })
      setLoading(false)
      return
    }

    const { data, error } = await supabase.functions.invoke('sync-github-stars', {
      body: { provider_token: session.provider_token },
    })

    setLoading(false)

    if (error) {
      setResult({ ok: false, message: error.message })
      return
    }

    setResult(data as SyncResult)
    onSynced?.()
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? t('syncing') : t('button')}
      </button>
      {result && (
        <p className={`text-sm ${result.ok ? 'text-emerald-600' : 'text-red-600'}`}>
          {result.ok
            ? t('success', {
                recognized: result.recognized ?? 0,
                skipped: result.skipped ?? 0,
              })
            : result.message}
        </p>
      )}
    </div>
  )
}
