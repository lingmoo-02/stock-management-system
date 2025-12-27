import { getCurrentUser } from './auth'
import { getUserRole } from './auth-actions'

/**
 * 現在のユーザーが管理者かどうかをチェック
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const role = await getUserRole(user.id)
    return role === 'ADMIN'
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
    const user = await getCurrentUser()
    if (!user) return null

    const role = await getUserRole(user.id)
    return role as 'USER' | 'ADMIN' | null
  } catch (error) {
    console.error('Error getting current user role:', error)
    return null
  }
}
