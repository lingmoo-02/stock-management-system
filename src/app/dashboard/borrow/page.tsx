'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronRight } from '@fortawesome/free-solid-svg-icons'

// Mock assets for selection
const mockAssets = [
  {
    id: '1',
    name: 'MacBook Pro 14',
    category: 'PC',
    status: 'AVAILABLE',
    description: 'Apple MacBook Pro 14 inch',
  },
  {
    id: '3',
    name: 'USB-C ケーブル',
    category: '周辺機器',
    status: 'AVAILABLE',
    description: 'USB-C cable',
  },
]

type BorrowStep = 'select' | 'dates' | 'confirm'

interface BorrowFormData {
  assetId: string
  startDate: string
  endDate: string
}

export default function BorrowPage() {
  const [step, setStep] = useState<BorrowStep>('select')
  const [formData, setFormData] = useState<BorrowFormData>({
    assetId: '',
    startDate: '',
    endDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedAsset = mockAssets.find((a) => a.id === formData.assetId)

  const handleSelectAsset = (assetId: string) => {
    setFormData({ ...formData, assetId })
    setStep('dates')
  }

  const handleDatesSubmit = () => {
    if (formData.startDate && formData.endDate) {
      setStep('confirm')
    }
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      // Show success - could add a toast notification here
      alert('備品の貸出申請が完了しました')
      setStep('select')
      setFormData({ assetId: '', startDate: '', endDate: '' })
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">備品を借りる</h1>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === 'select' || step === 'dates' || step === 'confirm'
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
              step === 'dates' || step === 'confirm' ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          />

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === 'dates' || step === 'confirm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              2
            </div>
            <p className="text-xs text-gray-600 mt-2">期間設定</p>
          </div>

          {/* Divider */}
          <div
            className={`w-16 h-1 transition ${step === 'confirm' ? 'bg-indigo-600' : 'bg-gray-300'}`}
          />

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                step === 'confirm' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              3
            </div>
            <p className="text-xs text-gray-600 mt-2">確認</p>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {step === 'select' && (
        <div className="space-y-4">
          <p className="text-gray-600">利用可能な備品を選択してください</p>
          <div className="space-y-3">
            {mockAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleSelectAsset(asset.id)}
                className="w-full bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
                    <p className="text-xs text-gray-500 mt-1">カテゴリ: {asset.category}</p>
                  </div>
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-400 w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'dates' && selectedAsset && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div className="p-4 bg-indigo-50 rounded-md border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900">{selectedAsset.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{selectedAsset.description}</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">借用開始日</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">返却予定日</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
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
              onClick={handleDatesSubmit}
              disabled={!formData.startDate || !formData.endDate}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && selectedAsset && (
        <div className="space-y-6 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-semibold text-green-800">入力内容をご確認ください</p>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">備品名</span>
                <span className="font-semibold text-gray-900">{selectedAsset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">カテゴリ</span>
                <span className="font-semibold text-gray-900">{selectedAsset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">借用開始日</span>
                <span className="font-semibold text-gray-900">{formData.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">返却予定日</span>
                <span className="font-semibold text-gray-900">{formData.endDate}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setStep('dates')}
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
              申請する
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
