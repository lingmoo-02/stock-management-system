'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserRole } from '@/lib/auth-actions'
import AssetList from '@/features/assets/components/AssetList'
import AssetRegistrationForm from '@/features/assets/components/AssetRegistrationForm'
import type { Asset } from '@/features/assets/types'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

export default function AdminAssetsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[AdminAssetsPage] Starting to load data...')

        // クライアント側で認証情報を取得
        const user = await getCurrentUser()
        console.log('[AdminAssetsPage] Current user:', user?.id, user?.email)

        if (!user) {
          console.log('[AdminAssetsPage] No authenticated user, redirecting to login')
          router.push('/login')
          return
        }

        setCurrentUserId(user.id)

        // Server Action でロール情報を取得
        try {
          const role = await getUserRole(user.id)
          console.log('[AdminAssetsPage] User role:', role)

          if (role !== 'ADMIN') {
            console.log('[AdminAssetsPage] User is not admin, redirecting')
            router.push('/dashboard/admin')
            return
          }

          setIsAdmin(true)

          // Server Action でアセット一覧を取得
          try {
            const { getAllAssetsAction } = await import('@/features/assets/server-actions')
            const assetsList = await getAllAssetsAction()
            console.log('[AdminAssetsPage] Assets loaded:', assetsList.length)
            setAssets(assetsList)
          } catch (assetsError) {
            console.error('[AdminAssetsPage] Error loading assets:', assetsError)
            setError('備品一覧の読み込みに失敗しました')
          }
        } catch (roleError) {
          console.error('[AdminAssetsPage] Error checking role:', roleError)
          setError('ロール情報の確認に失敗しました')
          router.push('/login')
        }
      } catch (error) {
        console.error('[AdminAssetsPage] Error:', error)
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

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">備品管理</h1>
          <p className="text-gray-600 mt-1">備品の登録・編集・削除を管理します</p>
        </div>

        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 transition"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          管理者画面に戻る
        </Link>
      </div>

      {/* Asset Registration Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">備品新規追加</h2>
        <AssetRegistrationForm
          currentUserId={currentUserId}
          onSuccess={() => {
            // 備品リストを再読み込み
            const loadAssets = async () => {
              try {
                const { getAllAssetsAction } = await import('@/features/assets/server-actions')
                const assetsList = await getAllAssetsAction()
                setAssets(assetsList)
              } catch (err) {
                console.error('Error reloading assets:', err)
              }
            }
            loadAssets()
          }}
        />
      </div>

      {/* Asset List */}
      <AssetList assets={assets} />
    </div>
  )
}
