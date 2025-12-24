// Server Component専用の認証機能
// このファイルは Server Component からのみ import してください

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'

// Server Component用のSupabaseクライアント（クッキー対応）
function createServerClient() {
  const cookieStore = cookies()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // クッキーセット失敗時は無視
          }
        },
      },
    }
  )
}

/**
 * Server Component用: クッキーからユーザー情報を取得
 */
export async function getServerUser() {
  try {
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    console.log('[getServerUser] user:', user?.id, user?.email)
    return user
  } catch (error) {
    console.error('[getServerUser] Error:', error)
    return null
  }
}

/**
 * ユーザープロフィールを取得
 */
export async function getUserProfile(userId: string) {
  try {
    console.log('[getUserProfile] Fetching profile for userId:', userId)
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    })
    console.log('[getUserProfile] Found profile:', profile)
    return profile
  } catch (error) {
    console.error('[getUserProfile] Error:', error)
    return null
  }
}

export type UserWithProfile = {
  id: string
  email: string | null
  profile: {
    id: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
    createdAt: Date
    updatedAt: Date
  } | null
}

/**
 * Server Component用: ユーザー情報とプロフィールを統合して取得
 */
export async function getServerUserWithProfile(): Promise<UserWithProfile | null> {
  try {
    const user = await getServerUser()
    if (!user) return null

    const profile = await getUserProfile(user.id)

    return {
      id: user.id,
      email: user.email ?? null,
      profile,
    }
  } catch (error) {
    console.error('Error getting server user with profile:', error)
    return null
  }
}
