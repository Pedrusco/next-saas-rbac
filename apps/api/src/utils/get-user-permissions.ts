import { defineAbility, userSchema, type Role } from '@saas/auth';

export function getUserPermissions(userId: string, role: Role) {
  const authUser = userSchema.parse({
    id: userId,
    role: role,
  });

  const ability = defineAbility(authUser);

  return ability;
}
