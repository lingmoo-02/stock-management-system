import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          備品管理システム
        </h1>

        <div className="flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition text-center"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="w-full px-4 py-2 bg-white text-indigo-600 font-semibold rounded-md border-2 border-indigo-600 hover:bg-indigo-50 transition text-center"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  )
}
