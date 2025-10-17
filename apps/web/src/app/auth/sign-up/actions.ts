'use server'

import { HTTPError } from 'ky'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { signUp } from '@/http/sign-up'

const signUpSchema = z
  .object({
    name: z.string().refine((value) => value.split(' ').length > 1, {
      error: 'Please, enter your full name.',
    }),
    email: z.email({ error: 'Please, provide a valid email address.' }),
    password: z
      .string()
      .min(6, { error: 'Password should have at least 6 characters.' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: 'Password confirmation does not match.',
    path: ['password_confirmation'],
  })

export async function signUpAction(_state: unknown, data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties
    // eslint-disable-next-line camelcase
    const { name, email, password, password_confirmation } =
      Object.fromEntries(data)

    const payload = {
      name: String(name),
      email: String(email),
      password: String(password),
      password_confirmation: String(password_confirmation),
    }

    return { success: false, message: null, errors, payload }
  }

  const { name, email, password } = result.data

  try {
    await signUp({
      name,
      email,
      password,
    })
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

  redirect('/auth/sign-in')
}
