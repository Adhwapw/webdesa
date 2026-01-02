'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn, AlertCircle, Loader2 } from 'lucide-react'
import { AdminUser } from '@/types'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      if (localStorage.getItem('admin')) {
        router.replace('/admin')
      }
    } catch (e) {
      console.error('Error accessing localStorage:', e)
    }
  }, [router])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (error || !data) {
        setError('Username atau password salah!')
        setLoading(false)
        return
      }

      const user = data as AdminUser
      const adminData: AdminUser = {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role
      }

      localStorage.setItem('admin', JSON.stringify(adminData))
      window.location.href = '/admin'

    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan sistem, silakan coba lagi.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-green-50 p-8 text-center border-b border-green-100">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 text-green-600 shadow-sm">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-bold text-green-900">Admin Login</h1>
          <p className="text-green-800 font-medium mt-2 text-sm">Masuk untuk mengelola Website Desa</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 text-sm font-medium">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              {/* LABEL LEBIH GELAP & TEBAL */}
              <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
              <input
                type="text"
                placeholder="Masukkan username admin"
                // INPUT TEXT HITAM PEKAT (text-gray-900) & PLACEHOLDER LEBIH JELAS
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-500 text-gray-900 font-medium"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder:text-gray-500 text-gray-900 font-medium"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold hover:bg-green-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform active:scale-[0.99] duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                'Masuk ke Dashboard'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-gray-50 px-8 py-4 text-center text-xs text-gray-600 font-medium border-t border-gray-200">
          &copy; 2025 Desa Citamiang. All rights reserved.
        </div>
      </div>
    </div>
  )
}