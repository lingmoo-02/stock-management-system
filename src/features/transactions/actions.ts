'use server'

import { prisma } from '@/lib/prisma'
import { getUserById } from '@/features/users/services/userService'
import { getAssetById } from '@/features/assets/services/assetService'
import { getTransactionById } from './services/transactionService'

/**
 * 備品を借りる（即時貸出）
 * ユーザーが備品を借りる時に呼ばれる
 */
export async function borrowAsset(userId: string, assetId: string) {
  try {
    console.log('[borrowAsset] Called with userId:', userId, 'assetId:', assetId)

    // 1. ユーザー存在確認
    const user = await getUserById(userId)
    if (!user) {
      return { success: false, error: 'ログインしてください' }
    }

    // 2. 備品存在確認
    const asset = await getAssetById(assetId)
    if (!asset) {
      return { success: false, error: '指定された備品が見つかりません' }
    }

    // 3. 備品が借りられる状態かチェック
    if (asset.status !== 'AVAILABLE') {
      return {
        success: false,
        error: `この備品は${asset.status === 'ON_LOAN' ? '貸出中' : 'メンテナンス中'}です`,
      }
    }

    // 4. 同じユーザーが既に同じ備品を借りていないかチェック
    const existingLoan = await prisma.transaction.findFirst({
      where: {
        userId,
        assetId,
        status: 'ON_LOAN',
      },
    })

    if (existingLoan) {
      return {
        success: false,
        error: 'この備品は既に借りています',
      }
    }

    // 5. Transactionレコード作成
    const now = new Date()
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        assetId,
        requestDate: now,
        loanStartDate: now,
        status: 'ON_LOAN',
      },
      include: {
        asset: true,
        user: true,
      },
    })

    // 6. 備品ステータスを ON_LOAN に更新
    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'ON_LOAN' },
    })

    console.log('[borrowAsset] Successfully borrowed asset:', transaction.id)

    return {
      success: true,
      data: transaction,
    }
  } catch (error) {
    console.error('[borrowAsset] Error:', error)
    return {
      success: false,
      error: '備品の借用に失敗しました',
    }
  }
}

/**
 * 備品を返却する
 * ユーザーが自分の借用記録を返却する時に呼ばれる
 */
export async function returnAsset(userId: string, transactionId: string) {
  try {
    console.log(
      '[returnAsset] Called with userId:',
      userId,
      'transactionId:',
      transactionId
    )

    // 1. ユーザー存在確認
    const user = await getUserById(userId)
    if (!user) {
      return { success: false, error: 'ログインしてください' }
    }

    // 2. Transaction存在確認
    const transaction = await getTransactionById(transactionId)
    if (!transaction) {
      return { success: false, error: '指定された貸出記録が見つかりません' }
    }

    // 3. ステータスが ON_LOAN かチェック
    if (transaction.status !== 'ON_LOAN') {
      return {
        success: false,
        error: '貸出中ではない記録は返却できません',
      }
    }

    // 4. 権限チェック：自分の貸出記録かを確認
    if (transaction.userId !== userId) {
      return {
        success: false,
        error: '他人の貸出記録は返却できません',
      }
    }

    // 5. Transactionステータスを RETURNED に更新
    const now = new Date()
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'RETURNED',
        returnDate: now,
      },
      include: {
        asset: true,
        user: true,
      },
    })

    // 6. 備品ステータスを AVAILABLE に戻す
    await prisma.asset.update({
      where: { id: transaction.assetId },
      data: { status: 'AVAILABLE' },
    })

    console.log('[returnAsset] Successfully returned asset:', transactionId)

    return {
      success: true,
      data: updatedTransaction,
    }
  } catch (error) {
    console.error('[returnAsset] Error:', error)
    return {
      success: false,
      error: '備品の返却に失敗しました',
    }
  }
}
