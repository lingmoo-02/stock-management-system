'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { useState } from 'react'
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

  const navLinks = [
    { href: '/dashboard', label: 'ホーム', icon: faHome },
    { href: '/dashboard/assets', label: '備品一覧', icon: faList },
    { href: '/dashboard/borrow', label: '貸出', icon: faDownload },
    { href: '/dashboard/return', label: '返却', icon: faUpload },
    { href: '/dashboard/admin', label: '管理者画面', icon: faCog },
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
