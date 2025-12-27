'use client'

import { useState, useMemo } from 'react'
import { Profile } from '../types'
import UserRoleBadge from './UserRoleBadge'
import RoleChangeDialog from './RoleChangeDialog'
import { updateUserRole } from '../actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons'

interface UserListProps {
  users: Profile[]
  currentUserId: string
}

export default function UserList({ users, currentUserId }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 検索フィルタリング
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users
    }

    const query = searchQuery.toLowerCase()
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }, [users, searchQuery])

  const handleOpenDialog = (user: Profile) => {
    setError(null)
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleRoleChange = async (userId: string, newRole: 'USER' | 'ADMIN') => {
    setLoading(true)
    setError(null)

    try {
      const result = await updateUserRole(userId, newRole)

      if (result.success) {
        setIsDialogOpen(false)
        setSelectedUser(null)
        alert('ロールを変更しました。ページを更新します。')
        window.location.reload()
      } else {
        setError(result.error || 'ロールの変更に失敗しました')
      }
    } catch (err) {
      setError('ロールの変更に失敗しました')
      console.error('Error updating role:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* 検索ボックス */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="名前またはメールアドレスで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="検索をクリア"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ユーザー一覧テーブル */}
      {filteredUsers.length === 0 && searchQuery ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            検索結果がありません
            <br />
            「{searchQuery}」に該当するユーザーはいません
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    名前
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ロール
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {user.id === currentUserId && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            あなた
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <UserRoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleOpenDialog(user)}
                        disabled={loading}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FontAwesomeIcon icon={faPen} className="w-4 h-4" />
                        変更
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedUser && (
        <RoleChangeDialog
          isOpen={isDialogOpen}
          user={selectedUser}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedUser(null)
            setError(null)
          }}
          onConfirm={handleRoleChange}
          isLoading={loading}
        />
      )}
    </>
  )
}
