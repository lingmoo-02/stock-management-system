import { redirect } from 'next/navigation'
import { getServerUserWithProfile } from '@/lib/auth-server'
import { getAllUsers } from '@/features/users/services/userService'
import UserList from '@/features/users/components/UserList'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default async function AdminUsersPage() {
  const currentUser = await getServerUserWithProfile()

  // 認証チェック
  if (!currentUser) {
    redirect('/login')
  }

  // 権限チェック
  if (currentUser.profile?.role !== 'ADMIN') {
    redirect('/dashboard/admin')
  }

  // ユーザー一覧を取得
  const users = await getAllUsers()

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
      <UserList users={users} currentUserId={currentUser.id} />
    </div>
  )
}
