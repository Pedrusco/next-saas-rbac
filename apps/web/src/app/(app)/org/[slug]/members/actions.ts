'use server'

import { type Role, roleSchema } from '@saas/auth'
import { HTTPError } from 'ky'
import { revalidateTag } from 'next/cache'
import z from 'zod'

import { getCurrentOrgFromCookies } from '@/auth/auth'
import { createInvite } from '@/http/create-invite'
import { removeMember } from '@/http/remove-member'
import { revokeInvite } from '@/http/revoke-invite'
import { updateMember } from '@/http/update-member'

const inviteSchema = z.object({
  email: z.email({ error: 'Invalid e-mail address.' }),
  role: roleSchema,
})

export async function createInviteAction(_state: unknown, data: FormData) {
  const currentOrg = await getCurrentOrgFromCookies()

  const result = inviteSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties
    const { email, role } = Object.fromEntries(data)

    const payload = {
      email: String(email),
      role: String(role),
    }

    return { success: false, message: null, errors, payload }
  }

  const { email, role } = result.data

  try {
    await createInvite({
      org: currentOrg!,
      email,
      role,
    })

    revalidateTag(`${currentOrg}/invites`)
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, errors: null, payload: result.data }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
      payload: result.data,
    }
  }

  return {
    success: true,
    message: 'Successfully created the invite.',
    errors: null,
    payload: result.data,
  }
}

export async function removeMemberAction(memberId: string) {
  const currentOrg = await getCurrentOrgFromCookies()

  await removeMember({
    org: currentOrg!,
    memberId,
  })

  revalidateTag(`${currentOrg}/members`)
}

export async function updateMemberAction(memberId: string, role: Role) {
  const currentOrg = await getCurrentOrgFromCookies()

  await updateMember({
    org: currentOrg!,
    memberId,
    role,
  })

  revalidateTag(`${currentOrg}/members`)
}

export async function revokeInviteAction(inviteId: string) {
  const currentOrg = await getCurrentOrgFromCookies()

  await revokeInvite({
    org: currentOrg!,
    inviteId,
  })

  revalidateTag(`${currentOrg}/invites`)
}
