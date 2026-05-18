import type { SupabaseClient, User } from '@supabase/supabase-js'

function parseGithubIdentity(user: User) {
  const identity = user.identities?.find((i) => i.provider === 'github')
  if (!identity) return null

  const data = identity.identity_data as Record<string, unknown>
  const githubUserId = Number(
    data.user_id ?? data.sub ?? identity.id ?? data.provider_id
  )
  const login =
    (data.preferred_username as string | undefined) ??
    (data.user_name as string | undefined) ??
    (data.login as string | undefined) ??
    ''

  if (!Number.isFinite(githubUserId) || !login) return null

  return {
    githubUserId,
    login,
    avatarUrl: (data.avatar_url as string | undefined) ?? null,
  }
}

/** Upsert github_accounts from auth user identities (after OAuth link). */
export async function ensureGithubAccountRow(
  supabase: SupabaseClient,
  user: User
) {
  const parsed = parseGithubIdentity(user)
  if (!parsed) return { ok: false as const, reason: 'no_github_identity' }

  const { error } = await supabase.from('github_accounts').upsert(
    {
      user_id: user.id,
      github_user_id: parsed.githubUserId,
      github_login: parsed.login,
      github_avatar_url: parsed.avatarUrl,
      last_synced_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return { ok: false as const, reason: error.message }
  return { ok: true as const }
}
