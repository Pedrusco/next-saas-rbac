import { cookies } from 'next/headers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone()
  const cookiesStore = await cookies()

  redirectUrl.pathname = '/auth/sign-in'

  cookiesStore.delete('token')

  return NextResponse.redirect(redirectUrl)
}
