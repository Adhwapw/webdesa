'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    console.log('🔍 Check existing admin:', adminData) // DEBUG
    if (adminData) {
      router.push('/admin')
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log('🔐 Trying to login...') // DEBUG
    console.log('Username:', username) // DEBUG
    console.log('Password:', password) // DEBUG

    try {
      // Query admin dari database
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      console.log('📊 Supabase response:', { data, error }) // DEBUG

      if (error || !data) {
        console.log('❌ Login failed:', error) // DEBUG
        setError('Username atau password salah!')
        setLoading(false)
        return
      }

      console.log('✅ Login success!') // DEBUG

      // Simpan data admin ke localStorage
      const adminData = {
        id: data.id,
        username: data.username,
        nama_lengkap: data.nama_lengkap,
        email: data.email,
        role: data.role
      }

      console.log('💾 Saving to localStorage:', adminData) // DEBUG
      localStorage.setItem('admin', JSON.stringify(adminData))
      
      // Verify tersimpan
      const saved = localStorage.getItem('admin')
      console.log('✓ Verified in localStorage:', saved) // DEBUG

      // Redirect ke dashboard
      console.log('🚀 Redirecting to /admin') // DEBUG
      window.location.href = '/admin'
    } catch (err) {
      console.error('💥 Login error:', err) // DEBUG
      setError('Terjadi kesalahan, coba lagi')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600 mt-2">Website Desa Sukamaju</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-gray-800"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <p>Username: <span className="font-mono font-bold text-gray-800">admin</span></p>
          <p>Password: <span className="font-mono font-bold text-gray-800">admin123</span></p>
        </div>
      </div>
    </div>
  )
}