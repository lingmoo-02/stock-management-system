import { createClient } from '@supabase/supabase-js'

// クライアント側用のSupabaseインスタンス（Client Componentで使用）
const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function getCurrentUser() {
  try {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    console.log('[getCurrentUser] user:', user?.id, user?.email)
    return user
  } catch (error) {
    console.error('[getCurrentUser] Error:', error)
    return null
  }
}

export async function signUp(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      console.error('SignUp error:', error)
      throw error
    }
    return { data, error: null }
  } catch (error) {
    console.error('SignUp exception:', error)
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}
