import type { Role } from '@saas/auth'
import { HTTPError } from 'ky'

import { api } from './api-client'

interface GetMembershipResponse {
  membership: {
    id: string
    role: Role
    organizationId: string
    userId: string
  }
}

export async function getMembership(org: string) {
  try {
    const result = await api
      .get(`organizations/${org}/membership`)
      .json<GetMembershipResponse>()

    return result
  } catch (err) {
    if (err instanceof HTTPError) {
      if (err.response.status === 401) {
        return { membership: null }
      }
    }

    throw err
  }
}
