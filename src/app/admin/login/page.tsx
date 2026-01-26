'use client'

import { useState, useEffect, Suspense } from 'react' // Tambah Suspense
import { useRouter, useSearchParams } from 'next/navigation' // Tambah useSearchParams
import { createClient } from '@/lib/supabase-client'
import { LogIn, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

// 1. Pindahkan logika form ke komponen terpisah
function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams() // Hook untuk baca URL
    const supabase = createClient()

    // 2. Efek untuk menangkap error dari URL (misal: Link expired)
    useEffect(() => {
        const errorDescription = searchParams.get('error_description')
        let errorMsg = ''
        if (errorDescription) {
            // Terjemahkan error umum ke Bahasa Indonesia yang ramah
            if (errorDescription.includes('Email link is invalid')) {
                errorMsg = 'Link reset password sudah kadaluarsa atau tidak valid. Silakan minta link baru.'
            } else {
                errorMsg = errorDescription
            }
        }
        if (errorMsg && errorMsg !== error) {
            setError(errorMsg)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setError('Email atau password salah!')
                setLoading(false)
                return
            }

            router.refresh()
            router.push('/admin')

        } catch (err) {
            console.error('Login error:', err)
            setError('Terjadi kesalahan sistem.')
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
                    <p className="text-green-800 font-medium mt-2 text-sm">Masuk via Supabase Auth</p>
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
                            <label className="block text-sm font-bold text-black mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="admin@desacitamiang.id"
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-black"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-black">Password</label>
                                <Link href="/admin/lupa-password" className="text-xs font-bold text-green-700 hover:underline">
                                    Lupa Password?
                                </Link>
                            </div>
                            <input
                                type="password"
                                placeholder="Masukkan password"
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-black"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Masuk Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

// 3. Export default dibungkus Suspense agar tidak error di Next.js saat build
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <LoginForm />
        </Suspense>
    )
}