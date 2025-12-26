'use server'

import { prisma } from './prisma'

/**
 * ユーザーのロール情報をPrismaから取得
 */
export async function getUserRole(userId: string) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    return profile?.role || null
  } catch (error) {
    console.error('[getUserRole] ERROR:', error)
    return null
  }
}
