import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithGitHub } from '@/http/sign-in-with-github'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json(
      { message: 'GitHub OAuth code was not found.' },
      { status: 400 },
    )
  }

  let token: string

  try {
    const result = await signInWithGitHub({ code })

    token = result.token
  } catch (err) {
    // If the API responded with a non-2xx status (for example: missing email),
    // signInWithGitHub will throw. Avoid letting the error bubble and return a
    // safe redirect to the sign-in page with an error query so the UI can show
    // a friendly message instead of a 500 page.

    const redirectUrl = request.nextUrl.clone()

    redirectUrl.pathname = '/auth/sign-in'
    redirectUrl.searchParams.set('error', 'github')

    return NextResponse.redirect(redirectUrl)
  }

  const cookieStore = await cookies()

  cookieStore.set('token', token, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  const inviteId = cookieStore.get('inviteId')?.value

  if (inviteId) {
    try {
      await acceptInvite(inviteId)
      cookieStore.delete('inviteId')
    } catch {}
  }

  const redirectUrl = request.nextUrl.clone()

  redirectUrl.pathname = '/'
  redirectUrl.search = ''

  return NextResponse.redirect(redirectUrl)
}
