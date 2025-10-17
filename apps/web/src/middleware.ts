import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next()

  if (pathname.includes('.')) {
    return response
  }

  if (pathname.startsWith('/org')) {
    const [, , slug] = pathname.split('/')
    if (slug && slug.length > 0) {
      response.cookies.set('org', slug, { path: '/' })
    }
  } else {
    response.cookies.delete('org')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
