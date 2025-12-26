'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, getCurrentUser } from '@/lib/auth'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faList,
  faDownload,
  faUpload,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // ロール情報を取得
  useEffect(() => {
    const checkRole = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          const { getUserRole } = await import('@/lib/auth-actions')
          const role = await getUserRole(user.id)
          setIsAdmin(role === 'ADMIN')
        }
      } catch (error) {
        console.error('Error checking role:', error)
      }
    }

    checkRole()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const handleAdminClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Server Action で Prisma から ロール情報を取得
      const { getUserRole } = await import('@/lib/auth-actions')
      const role = await getUserRole(user.id)

      if (role === 'ADMIN') {
        router.push('/dashboard/admin')
      } else {
        alert('管理者権限がありません')
      }
    } catch (error) {
      console.error('Admin check error:', error)
      alert('エラーが発生しました')
    }
  }

  const navLinks = [
    { href: '/dashboard', label: 'ホーム', icon: faHome },
    { href: '/dashboard/assets', label: '備品一覧', icon: faList },
    { href: '/dashboard/borrow', label: '貸出', icon: faDownload },
    { href: '/dashboard/return', label: '返却', icon: faUpload },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 sticky top-0 flex flex-col p-6">
      {/* Logo / System Name */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">備品管理</h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition ${
              isActive(link.href)
                ? 'bg-indigo-100 text-indigo-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={link.icon} className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Admin Link - Show only for admins */}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            onClick={handleAdminClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition ${
              isActive('/dashboard/admin')
                ? 'bg-indigo-100 text-indigo-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FontAwesomeIcon icon={faCog} className="w-5 h-5" />
            <span>管理者画面</span>
          </Link>
        )}
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
        title="ログアウト"
      >
        <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
        <span>ログアウト</span>
      </button>
    </div>
  )
}
