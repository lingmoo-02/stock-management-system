'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/permissions'
import { getServerUserWithProfile } from '@/lib/auth-server'
import { updateUserRoleSchema } from './schema'
import { getAdminCount, getUserById } from './services/userService'

/**
 * ユーザーのロールを変更する
 */
export async function updateUserRole(userId: string, newRole: 'USER' | 'ADMIN') {
  try {
    // 1. 管理者権限チェック
    await requireAdmin()

    // 2. バリデーション
    const validated = updateUserRoleSchema.parse({ userId, role: newRole })

    // 3. 自分自身のロール変更を防止
    const currentUser = await getServerUserWithProfile()
    if (currentUser?.id === userId && newRole === 'USER') {
      return {
        success: false,
        error: '自分自身の管理者権限を削除することはできません',
      }
    }

    // 4. ターゲットユーザーの確認
    const targetUser = await getUserById(userId)
    if (!targetUser) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // 5. 最後の管理者を削除しようとしていないかチェック
    if (targetUser.role === 'ADMIN' && newRole === 'USER') {
      const adminCount = await getAdminCount()
      if (adminCount <= 1) {
        return {
          success: false,
          error: '最後の管理者を削除することはできません',
        }
      }
    }

    // 6. DB更新
    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: { role: validated.role },
    })

    return {
      success: true,
      data: updatedUser,
    }
  } catch (error) {
    console.error('Error updating user role:', error)

    if (error instanceof Error && error.message === '管理者権限が必要です') {
      return {
        success: false,
        error: error.message,
      }
    }

    if (error instanceof Error && error.message.includes('validation')) {
      return {
        success: false,
        error: 'ロール値が無効です',
      }
    }

    return {
      success: false,
      error: 'ロールの変更に失敗しました',
    }
  }
}
