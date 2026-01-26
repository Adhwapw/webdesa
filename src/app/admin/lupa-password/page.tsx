'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            // Mengirim email reset password
            // redirectTo diarahkan ke halaman pengaturan agar user bisa langsung set password baru
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/admin/update-password`,
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Gagal mengirim email reset.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden p-8">
                <Link href="/admin/login" className="flex items-center text-sm text-gray-500 hover:text-green-600 mb-6 transition">
                    <ArrowLeft size={16} className="mr-1" /> Kembali ke Login
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4 text-green-600">
                        <Mail size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Lupa Password?</h1>
                    <p className="text-gray-600 mt-2 text-sm">Masukkan email admin Anda untuk menerima link reset password.</p>
                </div>

                {success ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in-up">
                        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-green-800 mb-2">Email Terkirim!</h3>
                        <p className="text-green-700 text-sm">
                            Silakan cek inbox (atau spam) email <strong>{email}</strong>. Klik link di dalamnya untuk membuat password baru.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Admin</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-700 text-white py-3.5 rounded-lg font-bold hover:bg-green-800 transition shadow-md flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Kirim Link Reset'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}