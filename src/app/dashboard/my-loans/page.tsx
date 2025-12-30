'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getTransactionsByUserId } from '@/features/transactions/services/transactionService'
import { returnAsset } from '@/features/transactions/actions'
import type { Transaction } from '@prisma/client'

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

export default function MyLoansPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<TransactionWithAsset[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [returningId, setReturningId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const user = await getCurrentUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        const data = await getTransactionsByUserId(user.id)
        setTransactions(data as TransactionWithAsset[])
      } catch (err) {
        console.error('Error loading transactions:', err)
        setError('借用状況の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, reloadTrigger])

  const handleReturn = async (transactionId: string) => {
    if (!userId) return

    setReturningId(transactionId)

    try {
      const result = await returnAsset(userId, transactionId)

      if (result.success) {
        // リロード用のトリガーを更新
        setReloadTrigger((prev) => prev + 1)
      } else {
        setError(result.error || '返却に失敗しました')
      }
    } catch (err) {
      console.error('Error returning asset:', err)
      setError('返却処理中にエラーが発生しました')
    } finally {
      setReturningId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  const onLoanTransactions = transactions.filter((t) => t.status === 'ON_LOAN')
  const returnedTransactions = transactions.filter((t) => t.status === 'RETURNED')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">借用状況</h1>
        <p className="text-gray-600 mt-1">あなたの備品借用履歴</p>
      </div>

      {/* 統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">借用中</div>
          <div className="text-3xl font-bold text-blue-600">
            {onLoanTransactions.length}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 text-sm font-medium mb-2">返却済み</div>
          <div className="text-3xl font-bold text-gray-600">
            {returnedTransactions.length}
          </div>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* 借用中の備品 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">借用中の備品</h2>
        </div>

        {onLoanTransactions.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            <p>借用中の備品はありません</p>
          </div>
        ) : (
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
                    貸出開始日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {onLoanTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.asset.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.asset.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.loanStartDate
                        ? new Date(
                            transaction.loanStartDate
                          ).toLocaleDateString('ja-JP')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleReturn(transaction.id)}
                        disabled={returningId === transaction.id}
                        className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                      >
                        {returningId === transaction.id
                          ? '返却中...'
                          : '返却する'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 返却済みの備品 */}
      {returnedTransactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">返却済みの備品</h2>
          </div>

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
                    貸出開始日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    返却日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.asset.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.asset.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.loanStartDate
                        ? new Date(
                            transaction.loanStartDate
                          ).toLocaleDateString('ja-JP')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.returnDate
                        ? new Date(transaction.returnDate).toLocaleDateString(
                            'ja-JP'
                          )
                        : '-'}
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
