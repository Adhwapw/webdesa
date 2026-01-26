import { createClient } from '@/lib/supabase-client'

type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'

export async function logActivity(
  action: ActionType,
  table: string,
  details: string
) {
  const supabase = createClient()

  // 1. Ambil user yang sedang login
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || !user.email) return // Jangan catat jika tidak ada user (atau sistem)

  // 2. Catat ke tabel
  const { error } = await supabase.from('activity_logs').insert([
    {
      admin_email: user.email,
      action_type: action,
      target_table: table,
      details: details
    }
  ])

  if (error) {
    console.error('Gagal mencatat log aktivitas:', error)
  }
}