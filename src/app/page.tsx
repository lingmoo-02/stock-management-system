import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">備品管理システム</h1>
        <p className="text-xl text-gray-600 mb-8">
          社内備品の貸出・返却状況を可視化し、紛失防止や在庫管理を行うシステム
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition"
          >
            新規登録
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">備品管理</h3>
            <p className="text-gray-600">
              社内のPC、モニター、備品などを一元管理
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">✋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">貸出申請</h3>
            <p className="text-gray-600">
              かんたんな操作で備品の借用・返却を申請
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-2">👁️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">可視化</h3>
            <p className="text-gray-600">
              貸出状況をリアルタイムで確認・管理
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
