'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { getCurrentUser } from '@/lib/auth'
import { borrowAsset } from '@/features/transactions/actions'
import type { Asset } from '@/features/assets/types'

export default function BorrowPage() {
  const router = useRouter()
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        // Server Action を使用して備品一覧を取得
        const { getAllAssetsAction } = await import(
          '@/features/assets/server-actions'
        )
        const assetsList = await getAllAssetsAction()
        // 利用可能な備品のみフィルタ
        const availableAssets = assetsList.filter(
          (asset) => asset.status === 'AVAILABLE'
        )
        setAssets(availableAssets)
      } catch (err) {
        console.error('Error loading assets:', err)
        setError('備品一覧の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const selectedAsset = assets.find((a) => a.id === selectedAssetId)

  // 検索フィルタリング
  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase()
    return (
      asset.name?.toLowerCase().includes(query) ||
      asset.category.toLowerCase().includes(query) ||
      asset.description?.toLowerCase().includes(query)
    )
  })

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handleConfirm = async () => {
    if (!userId || !selectedAssetId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await borrowAsset(userId, selectedAssetId)

      if (result.success) {
        setSuccessMessage('備品を借りました')
        setTimeout(() => {
          setSelectedAssetId(null)
          setSuccessMessage(null)
          // 資産一覧を更新するため、リロード
          window.location.reload()
        }, 1500)
      } else {
        setError(result.error || '借用に失敗しました')
      }
    } catch (err) {
      console.error('Error borrowing asset:', err)
      setError('予期しないエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSelectedAssetId(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">備品を借りる</h1>
        <p className="text-gray-600 mt-1">利用可能な備品から選択して借りることができます</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* 借用確認モーダル */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">備品詳細</h2>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <p className="text-sm text-gray-600">備品コード</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAsset.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">カテゴリ</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAsset.category}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">備考</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAsset.description || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">購入日</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedAsset.createdAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">最終更新日</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(selectedAsset.updatedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-t border-gray-200 pt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-white text-gray-600 border border-gray-300 font-semibold rounded-md hover:bg-gray-50 transition"
              >
                閉じる
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
                {isSubmitting ? '借用中...' : '借りる'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 検索ボックス */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="備品名、カテゴリ、説明で検索..."
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
      ) : assets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">利用可能な備品はありません</p>
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
                    購入日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    最終更新日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {asset.name}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(asset.updatedAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
