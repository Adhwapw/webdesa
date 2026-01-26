'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Key, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState({ type: '', text: '' })
    const router = useRouter()
    const supabase = createClient()

    // Cek session saat halaman dimuat
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                // Jika tidak ada session (link kedaluwarsa/salah), lempar ke login
                router.replace('/admin/login')
            }
        }
        checkSession()
    }, [router, supabase])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg({ type: '', text: '' })

        if (password.length < 6) {
            setMsg({ type: 'error', text: 'Password minimal 6 karakter.' })
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' })
            setLoading(false)
            return
        }

        try {
            // Update password user
            const { error } = await supabase.auth.updateUser({ password })
            
            if (error) throw error

            setMsg({ type: 'success', text: 'Password berhasil direset! Mengalihkan...' })
            
            // Redirect ke dashboard setelah 2 detik
            setTimeout(() => {
                router.replace('/admin')
            }, 2000)

        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Gagal mereset password.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8 animate-fade-in-up">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 text-green-600">
                        <Key size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-green-900">Buat Password Baru</h1>
                    <p className="text-gray-600 mt-2 text-sm">Silakan masukkan password baru untuk akun Anda.</p>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 text-sm font-medium ${
                        msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        {msg.type === 'success' ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                        <span>{msg.text}</span>
                    </div>
                )}

                <form onSubmit={handleUpdate} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Password Baru</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Minimal 6 karakter"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-800 mb-2">Konfirmasi Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            placeholder="Ulangi password baru"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold hover:bg-green-800 transition shadow-md flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Simpan Password Baru</>}
                    </button>
                </form>
            </div>
        </div>
    )
}