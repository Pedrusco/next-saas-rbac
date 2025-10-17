'use server'

import { HTTPError } from 'ky'
import { revalidateTag } from 'next/cache'
import z from 'zod'

import { getCurrentOrgFromCookies } from '@/auth/auth'
import { createOrganization } from '@/http/create-organization'
import { updateOrganization } from '@/http/update-organization'

const organizationSchema = z
  .object({
    name: z
      .string()
      .min(4, { error: 'Name should have at least 4 characters.' }),
    domain: z
      .string()
      .nullable()
      .refine(
        (value) => {
          if (value) {
            const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

            return domainRegex.test(value)
          }

          return true
        },
        { error: 'Please, provide a valid domain.' },
      ),
    shouldAttachUsersByDomain: z
      .union([z.literal('on'), z.literal('off'), z.boolean()])
      .transform((value) => value === true || value === 'on')
      .default(false),
  })
  .refine(
    (data) => {
      if (data.shouldAttachUsersByDomain === true && !data.domain) {
        return false
      }

      return true
    },
    {
      error: 'Domain is required when auto-join is enabled.',
      path: ['domain'],
    },
  )

export type OrganizationSchema = z.infer<typeof organizationSchema>

export async function createOrganizationAction(
  _state: unknown,
  data: FormData,
) {
  const result = organizationSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties

    return { success: false, message: null, errors }
  }

  const { name, domain, shouldAttachUsersByDomain } = result.data

  try {
    await createOrganization({
      name,
      domain,
      shouldAttachUsersByDomain,
    })

    revalidateTag('organizations')
  } catch (err) {
    if (err instanceof HTTPError) {
      const { message } = await err.response.json()

      return { success: false, message, errors: null }
    }

    console.error(err)

    return {
      success: false,
      message: 'Unexpected error, try again in a few minutes.',
      errors: null,
    }
  }

  return {
    success: true,
    message: 'Successfully saved the organization.',
    errors: null,
  }
}

export async function updateOrganizationAction(
  _state: unknown,
  data: FormData,
) {
  const currentOrg = await getCurrentOrgFromCookies()
  const result = organizationSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = z.treeifyError(result.error).properties
    const { name, domain, shouldAttachUsersByDomain } = Object.fromEntries(data)

    const payload = {
      name: String(name),
      domain: String(domain),
      shouldAttachUsersByDomain: shouldAttachUsersByDomain === 'on',
    }

    return { success: false, message: null, errors, payload }
  }

  const { name, domain, shouldAttachUsersByDomain } = result.data

  try {
    await updateOrganization({
      org: currentOrg!,
      name,
      domain,
      shouldAttachUsersByDomain,
    })

    revalidateTag('organizations')
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
    message: 'Successfully saved the organization.',
    errors: null,
    payload: result.data,
  }
}
