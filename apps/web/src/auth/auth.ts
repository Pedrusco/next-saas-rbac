import { defineAbility } from '@saas/auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getMembership } from '@/http/get-membership'
import { getProfile } from '@/http/get-profile'

export async function isAuthenticated() {
  const cookiesStore = await cookies()

  return !!cookiesStore.get('token')?.value
}

export async function getCurrentOrgFromCookies() {
  const cookieStore = await cookies()

  return cookieStore.get('org')?.value ?? null
}

export async function getCurrentMembership() {
  const org = await getCurrentOrgFromCookies()

  if (!org) {
    return null
  }

  const { membership } = await getMembership(org)

  return membership
}

export async function ability() {
  const membership = await getCurrentMembership()

  if (!membership) {
    return null
  }

  const ability = defineAbility({
    id: membership.userId,
    role: membership.role,
  })

  return ability
}

export async function auth() {
  const cookiesStore = await cookies()

  const token = cookiesStore.get('token')?.value

  if (!token) {
    redirect('/auth/sign-in')
  }

  try {
    const { user } = await getProfile()

    return { user }
  } catch {}

  redirect('/api/auth/sign-out')
}
