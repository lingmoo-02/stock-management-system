'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBox } from '@fortawesome/free-solid-svg-icons'

// Mock data
const mockAssets = [
  {
    id: '1',
    name: 'MacBook Pro 14',
    category: 'PC',
    status: 'AVAILABLE' as const,
    description: 'Apple MacBook Pro 14 inch',
  },
  {
    id: '2',
    name: 'Dell Monitor 27',
    category: 'モニター',
    status: 'ON_LOAN' as const,
    description: '27 inch 4K Monitor',
  },
  {
    id: '3',
    name: 'USB-C ケーブル',
    category: '周辺機器',
    status: 'AVAILABLE' as const,
    description: 'USB-C cable',
  },
]

const categories = ['すべて', 'PC', 'モニター', '周辺機器', 'オフィス用品']

type AssetStatus = 'AVAILABLE' | 'REQUESTED' | 'ON_LOAN' | 'MAINTENANCE'

const statusConfig: Record<AssetStatus, { label: string; bgColor: string; textColor: string }> = {
  AVAILABLE: { label: '利用可能', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  REQUESTED: { label: '申請中', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  ON_LOAN: { label: '貸出中', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  MAINTENANCE: { label: 'メンテナンス中', bgColor: 'bg-gray-100', textColor: 'text-gray-800' },
}

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべて')

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'すべて' || asset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">備品一覧</h1>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="備品名で検索..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-md font-medium transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => {
            const status = statusConfig[asset.status]
            return (
              <div key={asset.id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                {/* Image Placeholder */}
                <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                  <FontAwesomeIcon icon={faBox} className="text-4xl text-gray-400" />
                </div>

                {/* Asset Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-600">{asset.description}</p>
                  <div className="text-sm text-gray-500">カテゴリ: {asset.category}</div>

                  {/* Status Badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${status.bgColor} ${status.textColor}`}>
                    {status.label}
                  </span>

                  {/* View Details Link */}
                  <Link
                    href={`/dashboard/assets/${asset.id}`}
                    className="block w-full text-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition mt-4"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">検索条件に該当する備品がありません</p>
        </div>
      )}
    </div>
  )
}
