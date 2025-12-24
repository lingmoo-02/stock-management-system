import { z } from 'zod'

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDは必須です'),
  role: z.enum(['USER', 'ADMIN'], {
    errorMap: () => ({
      message: 'ロールはUSERまたはADMINである必要があります',
    }),
  }),
})

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
