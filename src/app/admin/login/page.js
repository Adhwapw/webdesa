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
    if (localStorage.getItem('admin')) {
      router.replace('/admin')
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) {
      setError('Username atau password salah')
      setLoading(false)
      return
    }

    localStorage.setItem('admin', JSON.stringify({
      id: data.id,
      username: data.username,
      nama_lengkap: data.nama_lengkap,
      email: data.email,
      role: data.role
    }))

    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-green-700 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 flex gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <input
          placeholder="Username"
          className="w-full border p-3 mb-4"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-6"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-green-600 text-white py-3"
        >
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
