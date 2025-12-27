'use server'

import { prisma } from '@/lib/prisma'
import type { Profile } from '@prisma/client'

/**
 * 全ユーザーのリストを取得するServer Action
 */
export async function getAllUsersAction(): Promise<Profile[]> {
  try {
    return await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error('[getAllUsersAction] Error:', error)
    return []
  }
}
