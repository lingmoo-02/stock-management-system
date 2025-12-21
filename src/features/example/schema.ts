/**
 * Example Feature Validation Schema
 * このファイルはZodを使用した入力バリデーションスキーマを定義します。
 */

import { z } from 'zod'

export const createExampleItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
})

export const updateExampleItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
})

export const exampleItemIdSchema = z.object({
  id: z.string().uuid(),
})

export type CreateExampleItemInput = z.infer<typeof createExampleItemSchema>
export type UpdateExampleItemInput = z.infer<typeof updateExampleItemSchema>
export type ExampleItemId = z.infer<typeof exampleItemIdSchema>
