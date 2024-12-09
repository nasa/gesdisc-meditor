import type { UserWithRoles } from '../auth/types'

export type UserDuringSetup = Pick<UserWithRoles, 'name' | 'uid'>
