'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Implement fetching assets from API
    setLoading(false)
  }, [])

  const categories = [
    { id: 'all', label: 'すべて' },
    { id: 'pc', label: 'PC' },
    { id: 'monitor', label: 'モニター' },
    { id: 'peripheral', label: '周辺機器' },
    { id: 'office', label: 'オフィス用品' },
  ]

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ON_LOAN':
        return 'bg-orange-100 text-orange-800'
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '利用可能'
      case 'REQUESTED':
        return '申請中'
      case 'ON_LOAN':
        return '貸出中'
      case 'MAINTENANCE':
        return '修理中'
      default:
        return status
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">備品一覧</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="備品名で検索..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">読込中...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  備品名
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">MacBook Pro</td>
                <td className="px-6 py-4 text-sm text-gray-600">PC</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColor('AVAILABLE')}`}>
                    {statusLabel('AVAILABLE')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href="/dashboard/assets/1"
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    詳細
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Empty state */}
          <div className="text-center py-12">
            <p className="text-gray-600">備品がまだ登録されていません</p>
          </div>
        </div>
      )}
    </div>
  )
}
