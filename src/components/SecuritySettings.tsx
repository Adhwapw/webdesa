'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AdminUser } from '@/types'
import { Shield, Key, Save, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function SecuritySettings() {
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<AdminUser | null>(null)

    // State untuk Setup Pertanyaan Keamanan
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [isSetupMode, setIsSetupMode] = useState(false)

    // State untuk Ganti Password
    const [step, setStep] = useState<'verify' | 'reset'>('verify')
    const [verifyAnswer, setVerifyAnswer] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [msg, setMsg] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        // Ambil ID dari localStorage
        const localData = localStorage.getItem('admin')
        if (!localData) return

        const parsed = JSON.parse(localData)

        // Ambil data terbaru dari Supabase
        const { data } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', parsed.id)
            .single()

        if (data) {
            setUser(data)
            // Jika belum ada pertanyaan, set mode setup
            if (!data.security_question) setIsSetupMode(true)
            else setQuestion(data.security_question)
        }
    }

    // FUNGSI 1: Simpan Pertanyaan & Jawaban Keamanan
    const handleSaveSecurity = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMsg({ type: '', text: '' })

        try {
            if (!user) return

            const { error } = await supabase
                .from('admin_users')
                .update({
                    security_question: question,
                    security_answer: answer.toLowerCase().trim() // Simpan dalam huruf kecil agar mudah dicocokkan
                })
                .eq('id', user.id)

            if (error) throw error

            setMsg({ type: 'success', text: 'Pertanyaan keamanan berhasil disimpan!' })
            setIsSetupMode(false)
            fetchUserData() // Refresh data
        } catch (err) {
            console.error(err)
            setMsg({ type: 'error', text: 'Gagal menyimpan pengaturan.' })
        } finally {
            setLoading(false)
        }
    }

    // FUNGSI 2: Verifikasi Jawaban untuk Ganti Password
    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.security_answer) {
            setMsg({ type: 'error', text: 'Anda belum mengatur pertanyaan keamanan!' })
            return
        }

        if (verifyAnswer.toLowerCase().trim() === user.security_answer) {
            setStep('reset')
            setMsg({ type: 'success', text: 'Verifikasi berhasil! Silakan buat password baru.' })
            setVerifyAnswer('')
        } else {
            setMsg({ type: 'error', text: 'Jawaban salah! Akses ditolak.' })
        }
    }

    // FUNGSI 3: Simpan Password Baru
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!user) return

            const { error } = await supabase
                .from('admin_users')
                .update({ password: newPassword })
                .eq('id', user.id)

            if (error) throw error

            setMsg({ type: 'success', text: 'Password berhasil diubah!' })
            setNewPassword('')
            setStep('verify') // Reset form
        } catch (err) {
            setMsg({ type: 'error', text: 'Gagal mengubah password.' })
        } finally {
            setLoading(false)
        }
    }

    // Class Styles
    const inputClass = "w-full border border-gray-400 rounded-lg px-4 py-3 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
    const labelClass = "block text-sm font-bold text-black mb-2"

    return (
        <div className="space-y-8">

            {/* BAGIAN 1: PENGATURAN PERTANYAAN KEAMANAN */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <Shield size={20} className="text-blue-700" /> Atur Pertanyaan Keamanan
                </h3>

                <form onSubmit={handleSaveSecurity} className="space-y-4">
                    <div>
                        <label className={labelClass}>Pertanyaan Keamanan</label>
                        <select
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            className={inputClass}
                            disabled={!isSetupMode}
                        >
                            <option value="" disabled>Pilih pertanyaan...</option>
                            <option value="Siapa nama gadis ibu kandung Anda?">Siapa nama gadis ibu kandung Anda?</option>
                            <option value="Apa nama hewan peliharaan pertama Anda?">Apa nama hewan peliharaan pertama Anda?</option>
                            <option value="Di kota mana Anda lahir?">Di kota mana Anda lahir?</option>
                            <option value="Apa makanan favorit masa kecil Anda?">Apa makanan favorit masa kecil Anda?</option>
                        </select>
                    </div>

                    {isSetupMode && (
                        <div>
                            <label className={labelClass}>Jawaban Anda</label>
                            <input
                                type="text"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                className={inputClass}
                                placeholder="Tulis jawaban rahasia..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">*Jawaban tidak membedakan huruf besar/kecil.</p>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        {isSetupMode ? (
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                            </button>
                        ) : (
                            <button type="button" onClick={() => setIsSetupMode(true)} className="text-blue-600 font-bold hover:underline text-sm">
                                Ubah Pertanyaan/Jawaban
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* BAGIAN 2: GANTI PASSWORD DENGAN VERIFIKASI */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
                    <Key size={20} className="text-red-700" /> Ganti Password
                </h3>

                {/* Notifikasi Pesan */}
                {msg.text && (
                    <div className={`p-4 rounded-lg mb-6 flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-medium">{msg.text}</span>
                    </div>
                )}

                {/* STEP 1: VERIFIKASI */}
                {step === 'verify' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                            <p className="text-sm text-yellow-800 font-medium">
                                Untuk keamanan, jawab pertanyaan ini sebelum mengganti password:
                            </p>
                            <p className="text-lg font-bold text-black mt-1">
                                &ldquo;{user?.security_question || 'Belum diatur'}&rdquo;
                            </p>
                        </div>

                        <div>
                            <input
                                type="text"
                                value={verifyAnswer}
                                onChange={e => setVerifyAnswer(e.target.value)}
                                className={inputClass}
                                placeholder="Masukkan jawaban Anda..."
                                required
                                disabled={!user?.security_question}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!user?.security_question}
                            className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition flex justify-center items-center gap-2"
                        >
                            <Lock size={18} /> Verifikasi Saya
                        </button>
                    </form>
                )}

                {/* STEP 2: PASSWORD BARU (Hanya muncul jika verifikasi sukses) */}
                {step === 'reset' && (
                    <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in-up">
                        <div>
                            <label className={labelClass}>Password Baru</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className={inputClass}
                                placeholder="Masukkan password baru minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex justify-center items-center gap-2"
                        >
                            <Save size={18} /> Simpan Password Baru
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}