import { getServerUserWithProfile } from './auth-server'

/**
 * 現在のユーザーが管理者かどうかをチェック
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getServerUserWithProfile()
    return user?.profile?.role === 'ADMIN'
  } catch (error) {
    console.error('Error checking admin permission:', error)
    return false
  }
}

/**
 * Server Actions で管理者権限を要求
 * 管理者でない場合はエラーをスロー
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('管理者権限が必要です')
  }
}

/**
 * 現在のユーザーのロールを取得
 */
export async function getCurrentUserRole(): Promise<'USER' | 'ADMIN' | null> {
  try {
    const user = await getServerUserWithProfile()
    return user?.profile?.role ?? null
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}
