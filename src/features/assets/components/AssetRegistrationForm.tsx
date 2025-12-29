'use client'

import { useState, useEffect } from 'react'
import type { CreateAssetInput } from '../schema'

interface AssetRegistrationFormProps {
  currentUserId: string
  onSuccess: () => void
}

export default function AssetRegistrationForm({
  currentUserId,
  onSuccess,
}: AssetRegistrationFormProps) {
  const [formData, setFormData] = useState<CreateAssetInput>({
    category: '',
    description: '',
    registrationDate: new Date(),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([])
  const [categoryMode, setCategoryMode] = useState<'select' | 'new'>('select')

  // コンポーネントマウント時に登録済みカテゴリを取得
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { getUniqueCategoriesServerAction } = await import('../server-actions')
        const categories = await getUniqueCategoriesServerAction()
        setSuggestedCategories(categories)
      } catch (err) {
        console.error('[AssetRegistrationForm] Error loading categories:', err)
      }
    }
    loadCategories()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value)
    setFormData((prev) => ({
      ...prev,
      registrationDate: date,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { createAsset } = await import('../actions')
      const result = await createAsset(currentUserId, formData)

      if (result.success) {
        setFormData({
          category: '',
          description: '',
          registrationDate: new Date(),
        })
        onSuccess()
      } else {
        setError(result.error || '備品登録に失敗しました')
      }
    } catch (err) {
      console.error('[AssetRegistrationForm] Error:', err)
      setError('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // 登録日をinput type="date"用のフォーマットに変換
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 登録日 */}
      <div>
        <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">
          登録日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="registrationDate"
          name="registrationDate"
          value={formatDateForInput(formData.registrationDate)}
          onChange={handleDateChange}
          required
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          カテゴリ選択 <span className="text-red-500">*</span>
        </label>

        {/* ラジオボタン: 横並び */}
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="categoryMode"
              value="select"
              checked={categoryMode === 'select'}
              onChange={(e) => {
                setCategoryMode(e.target.value as 'select' | 'new')
                setFormData((prev) => ({ ...prev, category: '' }))
              }}
              disabled={isLoading}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">既存カテゴリから選択</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="categoryMode"
              value="new"
              checked={categoryMode === 'new'}
              onChange={(e) => {
                setCategoryMode(e.target.value as 'select' | 'new')
                setFormData((prev) => ({ ...prev, category: '' }))
              }}
              disabled={isLoading}
              className="cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">新しいカテゴリを作成</span>
          </label>
        </div>

        {/* ドロップダウン */}
        {categoryMode === 'select' && (
          <div>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required={categoryMode === 'select'}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
            >
              <option value="">カテゴリを選択してください</option>
              {suggestedCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* テキスト入力 */}
        {categoryMode === 'new' && (
          <div>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="新規カテゴリ名を入力"
              required={categoryMode === 'new'}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {/* 備考 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          備考
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="備品の詳細情報、使用用途、注意事項など"
          disabled={isLoading}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '登録中...' : '登録'}
        </button>
      </div>
    </form>
  )
}
