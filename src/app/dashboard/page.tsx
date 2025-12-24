'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import QuickActionCard from '@/features/dashboard/components/QuickActionCard'
import { faDownload, faUpload } from '@fortawesome/free-solid-svg-icons'

export default function DashboardHome() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Extract name from email or use default
      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー'
      setUserName(name)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          こんにちは、{userName}さん
        </h1>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-6">
        <QuickActionCard
          href="/dashboard/borrow"
          label="貸出"
          icon={faDownload}
          bgColor="bg-green-50"
          textColor="text-green-700"
          description="備品を借りる"
        />
        <QuickActionCard
          href="/dashboard/return"
          label="返却"
          icon={faUpload}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          description="備品を返す"
        />
      </div>
    </div>
  )
}
