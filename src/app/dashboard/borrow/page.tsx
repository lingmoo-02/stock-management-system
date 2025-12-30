'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { getCurrentUser } from '@/lib/auth'
import { getAllAssets } from '@/features/assets/services/assetService'
import { borrowAsset } from '@/features/transactions/actions'
import type { Asset } from '@/features/assets/types'

type BorrowStep = 'select' | 'confirm'

interface BorrowFormData {
  assetId: string
}

export default function BorrowPage() {
  const router = useRouter()
  const [step, setStep] = useState<BorrowStep>('select')
  const [formData, setFormData] = useState<BorrowFormData>({
    assetId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [assets, setAssets] = useState<Asset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        const assetsList = await getAllAssets()
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

  const selectedAsset = assets.find((a) => a.id === formData.assetId)

  const handleSelectAsset = (assetId: string) => {
    setFormData({ assetId })
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!userId || !formData.assetId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await borrowAsset(userId, formData.assetId)

      if (result.success) {
        setSuccessMessage('備品を借りました')
        setTimeout(() => {
          setFormData({ assetId: '' })
          setStep('select')
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

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === 'select' || step === 'confirm'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              1
            </div>
            <p className="text-xs text-gray-600 mt-2">備品選択</p>
          </div>

          {/* Divider */}
          <div
            className={`w-16 h-1 transition ${
              step === 'confirm' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === 'confirm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              2
            </div>
            <p className="text-xs text-gray-600 mt-2">確認</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-gray-600">利用可能な備品を選択してください</p>
          {assets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">利用可能な備品はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset.id)}
                  className="w-full bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {asset.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {asset.description || '-'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        カテゴリ: {asset.category}
                      </p>
                    </div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className="text-gray-400 w-5 h-5"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && selectedAsset && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
              <p className="text-sm font-semibold text-indigo-800">
                この備品を借りてもよろしいですか？
              </p>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">備品コード</span>
                <span className="font-semibold text-gray-900">
                  {selectedAsset.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">カテゴリ</span>
                <span className="font-semibold text-gray-900">
                  {selectedAsset.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">説明</span>
                <span className="font-semibold text-gray-900">
                  {selectedAsset.description || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep('select')}
              className="flex-1 px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition"
            >
              戻る
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
              {isSubmitting ? '借用中...' : '今すぐ借りる'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
