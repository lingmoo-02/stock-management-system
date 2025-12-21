/**
 * Example Feature Services
 * このファイルはデータ取得処理（Repository パターン）を定義します。
 */

import { ExampleItem } from '../types'

/**
 * 全Exampleアイテムを取得
 * @returns アイテムのリスト
 */
export async function getAllExampleItems(): Promise<ExampleItem[]> {
  // TODO: Prismaを使用してデータベースから取得
  // const items = await prisma.exampleItem.findMany({
  //   orderBy: { createdAt: 'desc' },
  // })
  // return items

  // モック応答
  return []
}

/**
 * IDからExampleアイテムを取得
 * @param id - アイテムID
 * @returns アイテム（見つからない場合はnull）
 */
export async function getExampleItemById(_id: string): Promise<ExampleItem | null> {
  // TODO: Prismaを使用してデータベースから取得
  // const item = await prisma.exampleItem.findUnique({
  //   where: { id },
  // })
  // return item ?? null

  // モック応答
  return null
}

/**
 * Exampleアイテムを検索
 * @param keyword - 検索キーワード
 * @returns マッチしたアイテムのリスト
 */
export async function searchExampleItems(_keyword: string): Promise<ExampleItem[]> {
  // TODO: Prismaを使用してデータベースから検索
  // const items = await prisma.exampleItem.findMany({
  //   where: {
  //     OR: [
  //       { name: { contains: keyword } },
  //       { description: { contains: keyword } },
  //     ],
  //   },
  // })
  // return items

  // モック応答
  return []
}
