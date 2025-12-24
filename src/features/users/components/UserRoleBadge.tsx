import { Role } from '../types'

interface UserRoleBadgeProps {
  role: Role
}

export default function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const isAdmin = role === 'ADMIN'

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isAdmin ? '管理者' : '一般ユーザー'}
    </span>
  )
}
