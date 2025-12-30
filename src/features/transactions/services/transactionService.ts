'use server'

import { prisma } from '@/lib/prisma'
import type { Transaction } from '@prisma/client'

// ユーザーの貸出履歴取得
export async function getTransactionsByUserId(
  userId: string
): Promise<Transaction[]> {
  return await prisma.transaction.findMany({
    where: { userId },
    include: {
      asset: true,
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

// TransactionをID検索
export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  return await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      asset: true,
      user: true,
    },
  })
}
