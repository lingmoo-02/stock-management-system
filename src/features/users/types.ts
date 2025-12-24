import { Profile, Role } from '@prisma/client'

export type { Profile, Role }

export interface UserListItem {
  id: string
  name: string
  email: string
  role: Role
  createdAt: Date
}

export type UserRole = 'USER' | 'ADMIN'
