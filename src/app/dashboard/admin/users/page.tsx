'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserRole } from '@/lib/auth-actions'
import UserList from '@/features/users/components/UserList'
import UserRegistrationForm from '@/features/users/components/UserRegistrationForm'
import type { Profile } from '@/features/users/types'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons'

export default function AdminUsersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [users, setUsers] = useState<Profile[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[AdminUsersPage] Starting to load data...')

        // クライアント側で認証情報を取得
        const user = await getCurrentUser()
        console.log('[AdminUsersPage] Current user:', user?.id, user?.email)

        if (!user) {
          console.log('[AdminUsersPage] No authenticated user, redirecting to login')
          router.push('/login')
          return
        }

        setCurrentUserId(user.id)

        // Server Action でロール情報を取得
        try {
          const role = await getUserRole(user.id)
          console.log('[AdminUsersPage] User role:', role)

          if (role !== 'ADMIN') {
            console.log('[AdminUsersPage] User is not admin, redirecting')
            router.push('/dashboard/admin')
            return
          }

          setIsAdmin(true)

          // Server Action でユーザー一覧を取得
          try {
            const { getAllUsersAction } = await import('@/features/users/server-actions')
            const usersList = await getAllUsersAction()
            console.log('[AdminUsersPage] Users loaded:', usersList.length)
            setUsers(usersList)
          } catch (usersError) {
            console.error('[AdminUsersPage] Error loading users:', usersError)
            setError('ユーザー一覧の読み込みに失敗しました')
          }
        } catch (roleError) {
          console.error('[AdminUsersPage] Error checking role:', roleError)
          setError('ロール情報の確認に失敗しました')
          router.push('/login')
        }
      } catch (error) {
        console.error('[AdminUsersPage] Error:', error)
        setError('エラーが発生しました')
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
          <p className="text-gray-600 mt-1">ユーザーのロールを管理します</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegistrationModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
            ユーザー新規追加
          </button>

          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            管理者画面に戻る
          </Link>
        </div>
      </div>

      {/* User List */}
      <UserList users={users} currentUserId={currentUserId} />

      {/* User Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">ユーザー新規追加</h2>
              <button
                onClick={() => setShowRegistrationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <UserRegistrationForm
                currentUserId={currentUserId}
                onSuccess={() => {
                  setShowRegistrationModal(false)
                  // ユーザーリストを再読み込み
                  const loadUsers = async () => {
                    try {
                      const { getAllUsersAction } = await import('@/features/users/server-actions')
                      const usersList = await getAllUsersAction()
                      setUsers(usersList)
                    } catch (err) {
                      console.error('Error reloading users:', err)
                    }
                  }
                  loadUsers()
                }}
                onCancel={() => setShowRegistrationModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
