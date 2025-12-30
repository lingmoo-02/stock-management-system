'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { getCurrentUser } from '@/lib/auth'
import { getTransactionsByUserId } from '@/features/transactions/services/transactionService'
import { returnAsset } from '@/features/transactions/actions'
import type { Transaction } from '@prisma/client'

type ReturnStep = 'select' | 'confirm'

interface TransactionWithAsset extends Transaction {
  asset: {
    id: string
    name: string
    category: string
    status: string
    createdAt: Date
    updatedAt: Date
    description: string | null
    serialNumber: string | null
    imageUrl: string | null
  }
}

interface ReturnFormData {
  transactionId: string
}

export default function ReturnPage() {
  const router = useRouter()
  const [step, setStep] = useState<ReturnStep>('select')
  const [formData, setFormData] = useState<ReturnFormData>({
    transactionId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionWithAsset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[ReturnPage] Loading data...')
        const user = await getCurrentUser()
        console.log('[ReturnPage] Current user:', user)
        if (!user) {
          console.log('[ReturnPage] No user, redirecting to login')
          router.push('/login')
          return
        }

        setUserId(user.id)

        // 取引データ取得
        console.log('[ReturnPage] Fetching transactions for userId:', user.id)
        const data = await getTransactionsByUserId(user.id)
        console.log('[ReturnPage] Transactions loaded:', data)
        setTransactions(data as TransactionWithAsset[])
      } catch (err) {
        console.error('[ReturnPage] Error loading transactions:', err)
        setError(`借用状況の読み込みに失敗しました: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  // 借用中の備品のみフィルタ
  const onLoanTransactions = transactions.filter((t) => t.status === 'ON_LOAN')

  // 選択された取引
  const selectedTransaction = onLoanTransactions.find(
    (t) => t.id === formData.transactionId
  )

  // 検索フィルタリング
  const filteredTransactions = onLoanTransactions.filter((transaction) => {
    const query = searchQuery.toLowerCase()
    return (
      transaction.asset.name?.toLowerCase().includes(query) ||
      transaction.asset.category.toLowerCase().includes(query) ||
      transaction.asset.description?.toLowerCase().includes(query)
    )
  })

  const handleSelectTransaction = (transactionId: string) => {
    setFormData({ transactionId })
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!userId || !formData.transactionId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await returnAsset(userId, formData.transactionId)

      if (result.success) {
        setSuccessMessage('備品を返却しました')
        setTimeout(() => {
          setFormData({ transactionId: '' })
          setStep('select')
          setSuccessMessage(null)
          // 取引一覧を更新するため、リロード
          window.location.reload()
        }, 1500)
      } else {
        setError(result.error || '返却に失敗しました')
      }
    } catch (err) {
      console.error('Error returning asset:', err)
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
        <h1 className="text-3xl font-bold text-gray-900">備品を返却する</h1>
        <p className="text-gray-600 mt-1">借用中の備品から選択して返却できます</p>
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
          <p className="text-gray-600">返却する備品を選択してください</p>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <input
              type="text"
              placeholder="備品名、カテゴリ、説明で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Assets List */}
          {onLoanTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">借用中の備品はありません</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">
                検索結果がありません
                <br />
                「{searchQuery}」に該当する備品はいません
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={() => handleSelectTransaction(transaction.id)}
                  className="w-full bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.asset.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {transaction.asset.description || '-'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        カテゴリ: {transaction.asset.category}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        貸出日:{' '}
                        {transaction.loanStartDate
                          ? new Date(transaction.loanStartDate).toLocaleDateString(
                              'ja-JP'
                            )
                          : '-'}
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

      {step === 'confirm' && selectedTransaction && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-semibold text-red-800">
                備品を返却します
              </p>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">備品コード</span>
                <span className="font-semibold text-gray-900">
                  {selectedTransaction.asset.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">カテゴリ</span>
                <span className="font-semibold text-gray-900">
                  {selectedTransaction.asset.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">説明</span>
                <span className="font-semibold text-gray-900">
                  {selectedTransaction.asset.description || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">貸出開始日</span>
                <span className="font-semibold text-gray-900">
                  {selectedTransaction.loanStartDate
                    ? new Date(selectedTransaction.loanStartDate).toLocaleDateString(
                        'ja-JP'
                      )
                    : '-'}
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
              {isSubmitting ? '返却中...' : '返却する'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
