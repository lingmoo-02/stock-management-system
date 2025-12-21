'use server'

import { supabase } from '@/lib/supabase'
import { createUserProfile } from './services/authService'

export async function signUpAction(email: string, password: string, name: string) {
  try {
    // Supabase Auth でユーザー登録
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (signUpError) {
      console.error('SignUp error:', signUpError)
      return { success: false, error: signUpError.message }
    }

    if (!authData.user) {
      return { success: false, error: 'ユーザーの作成に失敗しました' }
    }

    // Profile テーブルにレコードを作成
    const { error: profileError } = await createUserProfile(
      authData.user.id,
      email,
      name
    )

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { success: false, error: 'プロフィールの作成に失敗しました' }
    }

    return {
      success: true,
      message: '登録しました。確認メールをご確認ください。',
    }
  } catch (error) {
    console.error('SignUp action error:', error)
    return { success: false, error: '登録処理でエラーが発生しました' }
  }
}
