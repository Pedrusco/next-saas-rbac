import { env } from '@saas/env'
import { getCookie } from 'cookies-next'
import ky from 'ky'

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        let token: string | undefined

        if (typeof window !== 'undefined') {
          token = getCookie('token') as string | undefined
        } else {
          const { cookies: getServerCookies } = await import('next/headers')

          const cookieStore = await getServerCookies()
          token = cookieStore.get('token')?.value
        }

        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})
