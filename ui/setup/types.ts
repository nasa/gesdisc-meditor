import type { User } from '../auth/types'

export type UserDuringSetup = Pick<User, 'name' | 'uid'>
