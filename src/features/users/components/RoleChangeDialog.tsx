'use client'

import { Profile } from '../types'

interface RoleChangeDialogProps {
  isOpen: boolean
  user: Profile
  onClose: () => void
  onConfirm: (userId: string, newRole: 'USER' | 'ADMIN') => void
  isLoading?: boolean
}

export default function RoleChangeDialog({
  isOpen,
  user,
  onClose,
  onConfirm,
  isLoading = false,
}: RoleChangeDialogProps) {
  if (!isOpen) return null

  const newRole: 'USER' | 'ADMIN' = user.role === 'ADMIN' ? 'USER' : 'ADMIN'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">ロール変更の確認</h3>
          <p className="text-gray-600 mt-2">
            <strong>{user.name}</strong> さんのロールを
            <strong className="text-indigo-600">
              {newRole === 'ADMIN' ? ' 管理者 ' : ' 一般ユーザー '}
            </strong>
            に変更しますか?
          </p>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => onConfirm(user.id, newRole)}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '変更中...' : '変更する'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
