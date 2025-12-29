'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faArrowLeft, faUser, faBox, faClipboard, faCog, faTimes } from '@fortawesome/free-solid-svg-icons'
import AssetRegistrationForm from '@/features/assets/components/AssetRegistrationForm'

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')

  useEffect(() => {
    const checkAdmin = async () => {
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

        if (role === 'ADMIN') {
          setIsAdmin(true)
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-12 text-center space-y-6">
          <div className="flex justify-center">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">アクセス権限がありません</h1>
            <p className="text-gray-600 mt-2">
              このページにアクセスする権限がありません。管理者のみがこのページを閲覧できます。
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理者画面</h1>
      </div>

      {/* Admin Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <Link
          href="/dashboard/admin/users"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faUser} className="text-2xl text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">ユーザー管理</h2>
          </div>
          <p className="text-gray-600 mb-6">
            ユーザーのロール変更、権限管理を行います
          </p>
          <div className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md text-center hover:bg-indigo-700 transition">
            ユーザー管理を開く
          </div>
        </Link>

        {/* Asset Management */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faBox} className="text-2xl text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">備品管理</h2>
          </div>
          <p className="text-gray-600 mb-6">
            備品の登録、編集、削除を行います
          </p>
          <button
            onClick={() => setShowAssetModal(true)}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition"
          >
            備品管理
          </button>
        </div>

        {/* Transaction Management */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-not-allowed opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faClipboard} className="text-2xl text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">申請管理</h2>
          </div>
          <p className="text-gray-600 mb-6">
            全ての申請を確認し、承認・却下を行います
          </p>
          <button className="w-full px-4 py-2 bg-gray-300 text-gray-500 font-semibold rounded-md cursor-not-allowed">
            申請管理（準備中）
          </button>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-not-allowed opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faCog} className="text-2xl text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">システム設定</h2>
          </div>
          <p className="text-gray-600 mb-6">
            ログ確認、システム統計を確認します
          </p>
          <button className="w-full px-4 py-2 bg-gray-300 text-gray-500 font-semibold rounded-md cursor-not-allowed">
            システム設定（準備中）
          </button>
        </div>
      </div>

      {/* Asset Registration Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">備品新規登録</h2>
              <button
                onClick={() => setShowAssetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <AssetRegistrationForm
                currentUserId={currentUserId}
                onSuccess={() => {
                  setShowAssetModal(false)
                  alert('備品を登録しました')
                }}
                onCancel={() => setShowAssetModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
