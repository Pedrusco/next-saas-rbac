'use server'

import { env } from '@saas/env'
import { redirect } from 'next/navigation'

export async function signInWithGitHub() {
  const gitHubSignInURL = new URL('login/oauth/authorize', 'https://github.com')

  gitHubSignInURL.searchParams.set('client_id', env.GITHUB_OAUTH_CLIENT_ID)
  gitHubSignInURL.searchParams.set(
    'redirect_uri',
    env.GITHUB_OAUTH_CLIENT_REDIRECT_URI,
  )
  gitHubSignInURL.searchParams.set('scope', 'user')

  redirect(gitHubSignInURL.toString())
}
