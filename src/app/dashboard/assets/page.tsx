'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AssetList from '@/features/assets/components/AssetList'
import type { Asset } from '@/features/assets/types'

export default function AssetsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[AssetsPage] Starting to load data...')

        // クライアント側で認証情報を取得
        const user = await getCurrentUser()
        console.log('[AssetsPage] Current user:', user?.id, user?.email)

        if (!user) {
          console.log('[AssetsPage] No authenticated user, redirecting to login')
          router.push('/login')
          return
        }

        setUserId(user.id)

        // Server Action でアセット一覧を取得
        try {
          const { getAllAssetsAction } = await import('@/features/assets/server-actions')
          const assetsList = await getAllAssetsAction()
          console.log('[AssetsPage] Assets loaded:', assetsList.length)
          setAssets(assetsList)
        } catch (assetsError) {
          console.error('[AssetsPage] Error loading assets:', assetsError)
          setError('備品一覧の読み込みに失敗しました')
        }
      } catch (error) {
        console.error('[AssetsPage] Error:', error)
        setError('エラーが発生しました')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">備品一覧</h1>
        <p className="text-gray-600 mt-1">利用可能な備品を確認できます</p>
      </div>

      {/* Asset List */}
      <AssetList assets={assets} userId={userId || undefined} />
    </div>
  )
}
