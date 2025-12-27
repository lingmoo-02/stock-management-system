'use server'

import { prisma } from '@/lib/prisma'
import { getUserRole } from '@/lib/auth-actions'
import { updateUserRoleSchema, createUserSchema } from './schema'
import { getAdminCount, getUserById, getUserByEmail } from './services/userService'
import { createClient } from '@supabase/supabase-js'

/**
 * ユーザーのロールを変更する
 * @param currentUserId - クライアント側で認証されたユーザーID
 * @param targetUserId - ロール変更対象のユーザーID
 * @param newRole - 新しいロール
 */
export async function updateUserRole(
  currentUserId: string,
  targetUserId: string,
  newRole: 'USER' | 'ADMIN'
) {
  try {
    console.log('[updateUserRole] Called with currentUserId:', currentUserId, 'targetUserId:', targetUserId)

    // 1. クライアント側で認証されたユーザーが実在するか確認
    const currentUser = await getUserById(currentUserId)
    console.log('[updateUserRole] Current user from DB:', currentUser?.id)

    if (!currentUser) {
      console.log('[updateUserRole] User not found in database')
      return {
        success: false,
        error: 'ログインしてください',
      }
    }

    // 2. 管理者権限チェック
    const currentUserRole = await getUserRole(currentUserId)
    console.log('[updateUserRole] Current user role:', currentUserRole)

    if (currentUserRole !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 3. バリデーション
    const validated = updateUserRoleSchema.parse({ userId: targetUserId, role: newRole })

    // 4. 自分自身のロール変更を防止
    if (currentUserId === targetUserId && newRole === 'USER') {
      return {
        success: false,
        error: '自分自身の管理者権限を削除することはできません',
      }
    }

    // 5. ターゲットユーザーの確認
    const targetUser = await getUserById(targetUserId)
    if (!targetUser) {
      return {
        success: false,
        error: 'ユーザーが見つかりません',
      }
    }

    // 6. 最後の管理者を削除しようとしていないかチェック
    if (targetUser.role === 'ADMIN' && newRole === 'USER') {
      const adminCount = await getAdminCount()
      if (adminCount <= 1) {
        return {
          success: false,
          error: '最後の管理者を削除することはできません',
        }
      }
    }

    // 7. DB更新
    const updatedUser = await prisma.profile.update({
      where: { id: targetUserId },
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

/**
 * 新しいユーザーを作成する
 * @param currentUserId - 認証されたユーザーID（管理者権限が必要）
 * @param input - ユーザー作成情報（メール、パスワード、名前）
 */
export async function createUser(
  currentUserId: string,
  input: unknown
) {
  try {
    console.log('[createUser] Called with currentUserId:', currentUserId)

    // 1. クライアント側で認証されたユーザーが実在するか確認
    const currentUser = await getUserById(currentUserId)
    console.log('[createUser] Current user from DB:', currentUser?.id)

    if (!currentUser) {
      console.log('[createUser] User not found in database')
      return {
        success: false,
        error: 'ログインしてください',
      }
    }

    // 2. 管理者権限チェック
    const currentUserRole = await getUserRole(currentUserId)
    console.log('[createUser] Current user role:', currentUserRole)

    if (currentUserRole !== 'ADMIN') {
      return {
        success: false,
        error: '管理者権限が必要です',
      }
    }

    // 3. バリデーション
    const validated = createUserSchema.parse(input)
    console.log('[createUser] Validation passed for email:', validated.email)

    // 4. メールアドレスの重複チェック
    const existingUser = await getUserByEmail(validated.email)
    if (existingUser) {
      console.log('[createUser] Email already exists:', validated.email)
      return {
        success: false,
        error: 'このメールアドレスは既に使用されています',
      }
    }

    // 5. Supabaseでユーザーを作成
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[createUser] Supabase credentials not configured')
      return {
        success: false,
        error: 'サーバー設定エラー',
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('[createUser] Supabase auth error:', authError)
      return {
        success: false,
        error: 'ユーザー認証情報の作成に失敗しました',
      }
    }

    console.log('[createUser] Supabase user created:', authData.user.id)

    // 6. Prismaでプロフィールを作成
    try {
      const newProfile = await prisma.profile.create({
        data: {
          id: authData.user.id,
          email: validated.email,
          name: validated.name,
          role: 'USER',
        },
      })

      console.log('[createUser] Profile created successfully:', newProfile.id)

      return {
        success: true,
        data: newProfile,
      }
    } catch (prismaError) {
      console.error('[createUser] Failed to create profile, cleaning up Supabase user:', prismaError)

      // Prisma作成失敗時はSupabaseユーザーも削除
      await supabase.auth.admin.deleteUser(authData.user.id)

      return {
        success: false,
        error: 'ユーザープロフィールの作成に失敗しました',
      }
    }
  } catch (error) {
    console.error('[createUser] Error:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return {
        success: false,
        error: 'ユーザー情報が無効です',
      }
    }

    return {
      success: false,
      error: 'ユーザーの作成に失敗しました',
    }
  }
}
