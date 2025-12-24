import { redirect } from 'next/navigation'
import { getServerUserWithProfile } from '@/lib/auth-server'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faArrowLeft, faUser, faBox, faClipboard, faCog } from '@fortawesome/free-solid-svg-icons'

export default async function AdminPage() {
  const currentUser = await getServerUserWithProfile()

  console.log('[AdminPage] currentUser:', JSON.stringify(currentUser, null, 2))

  // 認証チェック
  if (!currentUser) {
    redirect('/login')
  }

  // 権限チェック
  console.log('[AdminPage] currentUser.profile?.role:', currentUser.profile?.role)
  if (currentUser.profile?.role !== 'ADMIN') {
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
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-not-allowed opacity-75">
          <div className="flex items-center gap-3 mb-4">
            <FontAwesomeIcon icon={faBox} className="text-2xl text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">備品管理</h2>
          </div>
          <p className="text-gray-600 mb-6">
            備品の登録、編集、削除を行います
          </p>
          <button className="w-full px-4 py-2 bg-gray-300 text-gray-500 font-semibold rounded-md cursor-not-allowed">
            備品管理（準備中）
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
    </div>
  )
}
