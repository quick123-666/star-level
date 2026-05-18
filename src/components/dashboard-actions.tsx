'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { SyncStarsButton } from '@/components/sync-stars-button'

export function DashboardActions({ showSignOut }: { showSignOut?: boolean }) {
  const t = useTranslations('common')
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (showSignOut) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="text-sm text-zinc-500 underline"
      >
        {t('signOut')}
      </button>
    )
  }

  return <SyncStarsButton onSynced={() => router.refresh()} />
}
