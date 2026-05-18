type OAuthResult = {
  data: { url?: string | null; provider?: string } | null
  error: { message: string } | null
}

/**
 * Supabase OAuth/linkIdentity often returns { data: { url } } without auto-navigating.
 * Call this after linkIdentity or signInWithOAuth.
 */
export function redirectFromOAuthResult(result: OAuthResult): string | null {
  if (result.error) {
    return result.error.message
  }

  const url = result.data?.url
  if (url) {
    window.location.assign(url)
    return null
  }

  return 'No OAuth redirect URL returned'
}

export function buildAuthCallbackUrl(
  origin: string,
  locale: string,
  nextPath: string
) {
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`
  return `${origin}/${locale}/auth/callback?next=${encodeURIComponent(next)}`
}
