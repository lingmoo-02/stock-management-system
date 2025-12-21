'use client'

import Link from 'next/link'

export default function DashboardHome() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/dashboard/assets"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">備品一覧</h2>
          <p className="text-gray-600">社内備品を検索・閲覧</p>
        </Link>

        <Link
          href="/dashboard/my-loans"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">借用状況</h2>
          <p className="text-gray-600">あなたの借用中の備品</p>
        </Link>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">システム概要</h2>
        <ul className="text-blue-800 space-y-2">
          <li>• 社内PC、モニター、備品などの貸出状況を可視化</li>
          <li>• 紛失防止と効率的な在庫管理</li>
          <li>• 申請・承認ワークフローによる運用</li>
        </ul>
      </div>
    </div>
  )
}
