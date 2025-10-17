'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useActionState } from 'react'

import gitHubIcon from '@/assets/github-icon.svg'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

import { signInWithGitHub } from '../actions'
import { signUpAction } from './actions'

export function SignUpForm() {
  const [{ success, message, errors, payload }, formAction, isPending] =
    useActionState(signUpAction, {
      success: false,
      message: null,
      errors: null,
      payload: { name: '', email: '', password: '', password_confirmation: '' },
    })

  return (
    <form action={formAction} className="space-y-4">
      {!success && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>Sign in failed!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input name="name" id="name" defaultValue={payload.name} />

        {errors?.name && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors?.name.errors[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input
          name="email"
          type="email"
          id="email"
          defaultValue={payload.email}
        />

        {errors?.email && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors?.email.errors[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          type="password"
          id="password"
          defaultValue={payload.password}
        />

        {errors?.password && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors?.password.errors[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password_confirmation">Confirm your password</Label>
        <Input
          name="password_confirmation"
          type="password"
          id="password_confirmation"
          defaultValue={payload.password_confirmation}
        />

        {errors?.password_confirmation && (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">
            {errors?.password_confirmation.errors[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          'Create account'
        )}
      </Button>

      <Button variant="link" className="w-full" size="sm" asChild>
        <Link href="/auth/sign-in">Already registered? Sign in</Link>
      </Button>

      <Separator />

      <Button
        type="submit"
        formAction={signInWithGitHub}
        variant="outline"
        className="w-full"
      >
        <Image src={gitHubIcon} className="size-4 dark:invert" alt="" />
        Sign up with GitHub
      </Button>
    </form>
  )
}
