'use server'

import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { acceptInvite } from '@/http/accept-invite'
import { signInWithPassword } from '@/http/sign-in-with-password'

const signInSchema = z.object({
  email: z.email({ error: 'Please, provide a valid email address.' }),
  password: z.string().min(1, { error: 'Please, provide your password.' }),
})

export async function signInWithEmailAndPassword(
  _state: unknown,
  data: FormData,
) {
  const result = signInSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties

    const { email, password } = Object.fromEntries(data)

    const payload = {
      email: String(email),
      password: String(password),
    }

    return { success: false, message: null, errors, payload }
  }

  const { email, password } = result.data

  try {
    const { token } = await signInWithPassword({
      email,
      password,
    })

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

  redirect('/')
}
