'use client'

import { useState, useMemo } from 'react'
import type { Asset } from '../types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { borrowAsset } from '../../../features/transactions/actions'

interface AssetListProps {
  assets: Asset[]
  userId?: string
}

export default function AssetList({ assets, userId }: AssetListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) {
      return assets
    }

    const query = searchQuery.toLowerCase()
    return assets.filter(
      (asset) =>
        asset.name?.toLowerCase().includes(query) ||
        asset.category.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query)
    )
  }, [assets, searchQuery])

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleBorrow = async (assetId: string) => {
    if (!userId) {
      setMessage({ type: 'error', text: 'ログインが必要です' })
      return
    }

    setIsLoading(assetId)
    setMessage(null)

    try {
      const result = await borrowAsset(userId, assetId)

      if (result.success) {
        setMessage({ type: 'success', text: '備品を借りました' })
        // メッセージを2秒後に消去
        setTimeout(() => setMessage(null), 2000)
      } else {
        setMessage({ type: 'error', text: result.error || '借用に失敗しました' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '予期しないエラーが発生しました' })
    } finally {
      setIsLoading(null)
    }
  }

  // ステータスの日本語表示
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return '利用可能'
      case 'REQUESTED':
        return '申請中'
      case 'ON_LOAN':
        return '貸出中'
      case 'MAINTENANCE':
        return 'メンテナンス'
      default:
        return status
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'REQUESTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ON_LOAN':
        return 'bg-blue-100 text-blue-800'
      case 'MAINTENANCE':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      {/* 検索ボックス */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="備品名、カテゴリ、備考で検索..."
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

      {/* 備品一覧テーブル */}
      {filteredAssets.length === 0 && searchQuery ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">
            検索結果がありません
            <br />
            「{searchQuery}」に該当する備品はいません
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    備品コード
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    備考
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {asset.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-xs truncate" title={asset.description || ''}>
                        {asset.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(asset.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                          asset.status
                        )}`}
                      >
                        {getStatusLabel(asset.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {asset.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleBorrow(asset.id)}
                          disabled={isLoading === asset.id}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                        >
                          {isLoading === asset.id ? '借用中...' : '借りる'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* メッセージ表示 */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg font-medium ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  )
}
