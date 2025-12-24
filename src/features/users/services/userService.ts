import { prisma } from '@/lib/prisma'
import { Profile, Role } from '@prisma/client'

/**
 * 全ユーザーのリストを取得
 */
export async function getAllUsers(): Promise<Profile[]> {
  return await prisma.profile.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * ユーザーIDでプロフィールを取得
 */
export async function getUserById(userId: string): Promise<Profile | null> {
  return await prisma.profile.findUnique({
    where: { id: userId },
  })
}

/**
 * ロール別にユーザーを取得
 */
export async function getUsersByRole(role: Role): Promise<Profile[]> {
  return await prisma.profile.findMany({
    where: { role },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * 管理者ユーザーの数を取得
 */
export async function getAdminCount(): Promise<number> {
  return await prisma.profile.count({
    where: { role: 'ADMIN' },
  })
}

/**
 * ユーザーの総数を取得
 */
export async function getUserCount(): Promise<number> {
  return await prisma.profile.count()
}
