'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload, faCheck } from '@fortawesome/free-solid-svg-icons'

// Mock borrowed items
const mockBorrowedItems = [
  {
    id: '1',
    assetName: 'MacBook Pro 14',
    category: 'PC',
    borrowedDate: '2024-12-20',
    dueDate: '2025-01-10',
    description: 'Apple MacBook Pro 14 inch',
  },
  {
    id: '2',
    assetName: 'USB-C ケーブル',
    category: '周辺機器',
    borrowedDate: '2024-12-18',
    dueDate: '2024-12-25',
    description: 'USB-C cable',
  },
]

interface BorrowedItem {
  id: string
  assetName: string
  category: string
  borrowedDate: string
  dueDate: string
  description: string
}

export default function ReturnPage() {
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>(mockBorrowedItems)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedItem = borrowedItems.find((item) => item.id === selectedItemId)

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const handleReturnClick = (itemId: string) => {
    setSelectedItemId(itemId)
    setShowConfirm(true)
  }

  const handleConfirmReturn = async () => {
    if (!selectedItemId) return

    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setBorrowedItems((items) => items.filter((item) => item.id !== selectedItemId))
      setSelectedItemId(null)
      setShowConfirm(false)
      alert('備品を返却しました')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">借用中の備品</h1>
      </div>

      {/* Borrowed Items List */}
      {borrowedItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y">
            {borrowedItems.map((item) => {
              const overdue = isOverdue(item.dueDate)
              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.assetName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">カテゴリ</span>
                          <span className="text-gray-900">{item.category}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">借用日</span>
                          <span className="text-gray-900">{item.borrowedDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">返却予定日</span>
                          <span
                            className={overdue ? 'text-red-600 font-semibold' : 'text-gray-900'}
                          >
                            {item.dueDate}
                            {overdue && ' (期限切れ)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReturnClick(item.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                      <FontAwesomeIcon icon={faUpload} className="w-4 h-4" />
                      返却する
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">現在、借用中の備品はありません</p>
        </div>
      )}

      {/* Return Confirmation Modal */}
      {showConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">返却確認</h2>
              <p className="text-gray-600 mt-2">
                以下の備品を返却してよろしいですか？
              </p>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-600">備品名</span>
                <span className="font-semibold text-gray-900">{selectedItem.assetName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">カテゴリ</span>
                <span className="font-semibold text-gray-900">{selectedItem.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">返却予定日</span>
                <span className="font-semibold text-gray-900">{selectedItem.dueDate}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setSelectedItemId(null)
                }}
                className="flex-1 px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-600 font-semibold rounded-md hover:bg-indigo-50 transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                返却する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
