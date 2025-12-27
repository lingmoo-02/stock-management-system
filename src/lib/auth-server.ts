'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server Actions用：Cookie から認証情報を取得
 * このファイルは Server Action コンテキストでのみ使用
 */
export async function getCurrentUserServer() {
  try {
    const cookieStore = cookies()

    // すべてのcookieを取得してデバッグ
    const allCookies = cookieStore.getAll()
    console.log('[getCurrentUserServer] All cookies:', allCookies.map(c => c.name))

    // 複数のパターンでauth cookieを探す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    let projectId = ''
    try {
      projectId = supabaseUrl.split('.supabase.co')[0].split('//')[1] || ''
    } catch {
      console.error('[getCurrentUserServer] Failed to extract project ID from URL')
    }

    const authTokenPatterns = [
      `sb-${projectId}-auth-token`,
      'sb-auth-token',
      'supabase-auth-token',
    ]

    console.log('[getCurrentUserServer] Looking for auth tokens:', authTokenPatterns)

    let authToken: string | null = null
    for (const pattern of authTokenPatterns) {
      const token = cookieStore.get(pattern)?.value
      if (token) {
        console.log(`[getCurrentUserServer] Found token with pattern: ${pattern}`)
        authToken = token
        break
      }
    }

    if (!authToken) {
      console.log('[getCurrentUserServer] No auth token found in any pattern')
      return null
    }

    // Cookie の値から access_token を抽出
    let accessToken: string | null = null
    try {
      const tokenData = JSON.parse(authToken)
      accessToken = tokenData.access_token
      console.log('[getCurrentUserServer] Extracted access token from JSON')
    } catch {
      accessToken = authToken
      console.log('[getCurrentUserServer] Using auth token directly as access token')
    }

    if (!accessToken) {
      console.log('[getCurrentUserServer] No access token in auth token')
      return null
    }

    // Access Token を使用して user 情報を取得
    const serverClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )

    const {
      data: { user },
      error,
    } = await serverClient.auth.getUser(accessToken)

    if (error || !user) {
      console.log('[getCurrentUserServer] Error getting user:', error?.message)
      return null
    }

    console.log('[getCurrentUserServer] user:', user?.id, user?.email)
    return user
  } catch (error) {
    console.error('[getCurrentUserServer] Error:', error)
    return null
  }
}
