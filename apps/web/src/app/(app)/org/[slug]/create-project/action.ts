'use server'

import { HTTPError } from 'ky'
import { z } from 'zod'

import { getCurrentOrgFromCookies } from '@/auth/auth'
import { createProject } from '@/http/create-project'

const projectSchema = z.object({
  name: z.string().min(4, { error: 'Name should have at least 4 characters.' }),
  description: z.string(),
})

export async function createProjectAction(_state: unknown, data: FormData) {
  const result = projectSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties
    const { name, description } = Object.fromEntries(data)

    const payload = {
      name: String(name),
      description: String(description),
    }

    return { success: false, message: null, errors, payload }
  }

  const { name, description } = result.data

  try {
    const currentOrg = await getCurrentOrgFromCookies()

    await createProject({
      org: currentOrg!,
      name,
      description,
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

  return {
    success: true,
    message: 'Successfully saved the project.',
    errors: null,
    payload: result.data,
  }
}
