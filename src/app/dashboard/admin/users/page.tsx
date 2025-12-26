'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: Date
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setCurrentUserId(user.id)

        // Server Action で Prisma から ロール情報を取得
        const { getUserRole } = await import('@/lib/auth-actions')
        const role = await getUserRole(user.id)

        if (role !== 'ADMIN') {
          router.push('/dashboard/admin')
          return
        }

        setIsAdmin(true)

        // ユーザー一覧を取得
        const { getAllUsers } = await import('@/features/users/services/userService')
        const usersList = await getAllUsers()
        setUsers(usersList as User[])
      } catch (error) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const { UserList } = require('@/features/users/components/UserList')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">ユーザーのロールを管理します</p>
        </div>

        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          管理者画面に戻る
        </Link>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">ユーザー総数</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm">管理者数</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>

      {/* User List */}
      <UserList users={users} currentUserId={currentUserId} />
    </div>
  )
}
