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

export const createUserSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  name: z.string().min(1, '名前は必須です'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
