export function can(user, module, action) {
  if (!user?.role) return false
  if (user.role.name === 'Super Admin') return true
  const entry = user.role.permissions?.find((p) => p.module === module)
  return Boolean(entry?.actions?.includes(action))
}
