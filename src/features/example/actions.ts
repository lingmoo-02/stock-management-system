/**
 * Example Feature Server Actions
 * このファイルはデータ更新処理（Create, Update, Delete）を定義します。
 */

'use server'

import { createExampleItemSchema, updateExampleItemSchema } from './schema'

/**
 * 新規Exampleアイテムを作成
 * @param input - 作成入力データ
 * @returns 作成されたアイテム
 */
export async function createExampleItem(input: unknown) {
  // バリデーション
  const validated = createExampleItemSchema.parse(input)

  // TODO: Prismaを使用してデータベースに保存
  // const item = await prisma.exampleItem.create({
  //   data: validated,
  // })

  // モック応答
  return {
    success: true,
    data: {
      id: '1',
      name: validated.name,
      description: validated.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }
}

/**
 * Exampleアイテムを更新
 * @param id - アイテムID
 * @param input - 更新入力データ
 * @returns 更新されたアイテム
 */
export async function updateExampleItem(id: string, input: unknown) {
  // バリデーション
  const validated = updateExampleItemSchema.parse(input)

  // TODO: Prismaを使用してデータベースを更新
  // const item = await prisma.exampleItem.update({
  //   where: { id },
  //   data: validated,
  // })

  // モック応答
  return {
    success: true,
    data: {
      id,
      name: validated.name ?? 'Example',
      description: validated.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }
}

/**
 * Exampleアイテムを削除
 * @param id - アイテムID
 * @returns 削除結果
 */
export async function deleteExampleItem(id: string) {
  // TODO: Prismaを使用してデータベースから削除
  // await prisma.exampleItem.delete({
  //   where: { id },
  // })

  return {
    success: true,
    message: `Item ${id} deleted successfully`,
  }
}
