import { z } from 'zod'

export const createAssetSchema = z.object({
  category: z.string().min(1, 'カテゴリは必須です'),
  description: z.string().min(1, '備考は必須です'),
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
