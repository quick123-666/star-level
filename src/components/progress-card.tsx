'use client'

import { useTranslations } from 'next-intl'
import type { MyProgress } from '@/types/database'

export function ProgressCard({ progress }: { progress: MyProgress }) {
  const t = useTranslations('progress')

  if (!progress.authenticated) return null

  const maxLevel = progress.is_max_level ?? false
  const required = progress.xp_required_for_next_level
  const current = progress.xp_in_current_level ?? 0
  const pct =
    maxLevel || !required
      ? 100
      : Math.min(100, Math.round((current / required) * 100))

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{t('currentLevel')}</p>
          <p className="text-4xl font-bold tabular-nums">
            Lv.{progress.level}
            {maxLevel && (
              <span className="ml-2 text-base font-normal text-amber-600">
                {t('maxLevel')}
              </span>
            )}
          </p>
        </div>
        <div className="text-right text-sm text-zinc-500">
          <p>{t('totalXp', { value: progress.total_xp?.toLocaleString() ?? '0' })}</p>
          <p>
            {t('lifetimeRepos', {
              count: progress.lifetime_recognitions ?? 0,
            })}
          </p>
        </div>
      </div>

      {!maxLevel && required != null && (
        <div className="mt-6">
          <div className="mb-1 flex justify-between text-xs text-zinc-500">
            <span>{t('levelProgress')}</span>
            <span>{t('xpRatio', { current, required })}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
        <div>
          <p className="text-xs text-zinc-500">{t('todayRecognized')}</p>
          <p className="text-lg font-semibold tabular-nums">
            {progress.today_recognized_count} / {progress.daily_cap}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">{t('todayXp')}</p>
          <p className="text-lg font-semibold tabular-nums">
            {progress.today_xp_earned} XP
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        {t('footer', { date: progress.business_date ?? '—' })}
      </p>
    </div>
  )
}
