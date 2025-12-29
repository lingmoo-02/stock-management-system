'use server'

import { prisma } from '@/lib/prisma'
import { getUserRole } from '@/lib/auth-actions'
import { createAssetSchema } from './schema'
import { getUserById } from '@/features/users/services/userService'
import { generateNextAssetCode } from './services/assetService'

export async function createAsset(
  currentUserId: string,
  input: unknown
) {
  try {
    console.log('[createAsset] Called with currentUserId:', currentUserId)

    // 1. ユーザー存在確認
    const currentUser = await getUserById(currentUserId)
    if (!currentUser) {
      return { success: false, error: 'ログインしてください' }
    }

    // 2. 管理者権限チェック
    const currentUserRole = await getUserRole(currentUserId)
    if (currentUserRole !== 'ADMIN') {
      return { success: false, error: '管理者権限が必要です' }
    }

    // 3. バリデーション
    const validated = createAssetSchema.parse(input)
    console.log('[createAsset] Validation passed for category:', validated.category)

    // 4. 備品コードを自動生成
    const assetCode = await generateNextAssetCode(validated.category)
    console.log('[createAsset] Generated asset code:', assetCode)

    // 5. データベース登録
    const newAsset = await prisma.asset.create({
      data: {
        name: assetCode,
        category: validated.category,
        description: validated.description,
        status: 'AVAILABLE',
      },
    })

    console.log('[createAsset] Asset created successfully:', newAsset.id)

    return {
      success: true,
      data: newAsset,
    }
  } catch (error) {
    console.error('[createAsset] Error:', error)

    if (error instanceof Error && error.message.includes('validation')) {
      return {
        success: false,
        error: '入力内容が無効です',
      }
    }

    return {
      success: false,
      error: '備品の登録に失敗しました',
    }
  }
}
