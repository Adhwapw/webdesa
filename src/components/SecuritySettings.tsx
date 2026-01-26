'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client' // Gunakan helper client baru
import { Key, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function SecuritySettings() {
    const [loading, setLoading] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [msg, setMsg] = useState({ type: '', text: '' })
    
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg({ type: '', text: '' })

        if (newPassword.length < 6) {
            setMsg({ type: 'error', text: 'Password minimal 6 karakter' })
            setLoading(false)
            return
        }

        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok' })
            setLoading(false)
            return
        }

        try {
            // Update password user yang sedang login
            const { error } = await supabase.auth.updateUser({ 
                password: newPassword 
            })

            if (error) throw error

            setMsg({ type: 'success', text: 'Password berhasil diperbarui!' })
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            console.error('Error changing password:', err)
            setMsg({ type: 'error', text: err.message || 'Gagal mengganti password.' })
        } finally {
            setLoading(false)
        }
    }

    const inputClass = "w-full border border-gray-400 rounded-lg px-4 py-3 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
    const labelClass = "block text-sm font-bold text-black mb-2"

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl">
            <h3 className="text-lg font-bold text-black mb-6 flex items-center gap-2 border-b pb-4">
                <Key size={20} className="text-green-700" /> Ganti Password Admin
            </h3>

            {msg.text && (
                <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                    {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="text-sm font-medium">{msg.text}</span>
                </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                    <label className={labelClass}>Password Baru</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Minimal 6 karakter"
                        required
                    />
                </div>

                <div>
                    <label className={labelClass}>Konfirmasi Password Baru</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Ulangi password baru"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition flex justify-center items-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Simpan Password Baru
                </button>
            </form>
        </div>
    )
}