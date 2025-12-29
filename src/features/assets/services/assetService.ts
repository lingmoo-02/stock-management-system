import { prisma } from '@/lib/prisma'
import type { Asset } from '@prisma/client'

// 全備品取得
export async function getAllAssets(): Promise<Asset[]> {
  return await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

// 登録済みのユニークなカテゴリを取得
export async function getUniqueCategoriesAction(): Promise<string[]> {
  const assets = await prisma.asset.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })
  return assets.map((asset) => asset.category)
}

// ID検索
export async function getAssetById(assetId: string): Promise<Asset | null> {
  return await prisma.asset.findUnique({
    where: { id: assetId },
  })
}

// カテゴリ別取得
export async function getAssetsByCategory(category: string): Promise<Asset[]> {
  return await prisma.asset.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
  })
}

// カテゴリコード生成（カテゴリ名→アルファベット2文字）
export function generateCategoryCode(category: string): string {
  const alphanumeric = category.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

  if (alphanumeric.length >= 2) {
    return alphanumeric.substring(0, 2)
  } else if (alphanumeric.length === 1) {
    return alphanumeric + 'X'
  } else {
    return 'XX'
  }
}

// 次の備品コードを生成
export async function generateNextAssetCode(category: string): Promise<string> {
  const categoryCode = generateCategoryCode(category)

  // 該当カテゴリの最新備品を取得
  const latestAsset = await prisma.asset.findFirst({
    where: { category },
    orderBy: { name: 'desc' },
  })

  let nextNumber = 1

  if (latestAsset && latestAsset.name) {
    // 既存のコードから番号を抽出（例: "PC-005" → 5）
    const match = latestAsset.name.match(/-(\d{3})$/)
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1
    }
  }

  // 3桁のゼロパディング
  const paddedNumber = nextNumber.toString().padStart(3, '0')

  return `${categoryCode}-${paddedNumber}`
}
