'use client'

import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, Loader2, Building, Phone, BookOpen, History } from 'lucide-react'

export default function AdminPengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // State Form
  const [namaDesa, setNamaDesa] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [email, setEmail] = useState('')
  const [sejarah, setSejarah] = useState('')
  const [visi, setVisi] = useState('')
  const [misi, setMisi] = useState('')

  useEffect(() => {
    fetchProfil()
  }, [])

  const fetchProfil = async () => {
    try {
      const { data, error } = await supabase.from('profil_desa').select('*').single()
      if (data) {
        setNamaDesa(data.nama_desa || '')
        setAlamat(data.alamat_lengkap || '')
        setTelepon(data.telepon || '')
        setEmail(data.email || '')
        setSejarah(data.sejarah || '')
        setVisi(data.visi || '')
        setMisi(data.misi || '')
      }
    } catch (error) {
      console.error('Error fetching profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profil_desa')
        .update({
            nama_desa: namaDesa,
            alamat_lengkap: alamat,
            telepon: telepon,
            email: email,
            sejarah: sejarah,
            visi: visi,
            misi: misi
        })
        .eq('id', 1)

      if (error) throw error
      alert('Pengaturan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  // Class untuk Input agar kontras tinggi (HITAM DI ATAS PUTIH)
  const inputClass = "w-full border border-gray-400 rounded-lg px-4 py-3 bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
  const labelClass = "block text-sm font-bold text-black mb-2"

  if (loading) return <div className="p-8 text-center text-black">Memuat data...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Pengaturan Profil Desa</h1>
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Identitas Dasar */}
        <div>
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
                <Building size={20} className="text-green-700" /> Identitas & Kontak
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Nama Desa</label>
                    <input type="text" value={namaDesa} onChange={e => setNamaDesa(e.target.value)} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>No. Telepon / WA</label>
                    <input type="text" value={telepon} onChange={e => setTelepon(e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                    <label className={labelClass}>Alamat Lengkap</label>
                    <textarea value={alamat} onChange={e => setAlamat(e.target.value)} className={inputClass} rows={3} />
                </div>
            </div>
        </div>

        {/* Sejarah */}
        <div>
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
                <History size={20} className="text-blue-700" /> Sejarah Desa
            </h3>
            <div>
                <label className={labelClass}>Cerita Sejarah</label>
                <textarea value={sejarah} onChange={e => setSejarah(e.target.value)} className={inputClass} rows={6} />
            </div>
        </div>

        {/* Visi Misi */}
        <div>
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
                <BookOpen size={20} className="text-purple-700" /> Visi & Misi
            </h3>
            <div className="space-y-6">
                <div>
                    <label className={labelClass}>Visi</label>
                    <textarea value={visi} onChange={e => setVisi(e.target.value)} className={inputClass} rows={3} placeholder="Visi desa..." />
                </div>
                <div>
                    <label className={labelClass}>Misi</label>
                    <textarea value={misi} onChange={e => setMisi(e.target.value)} className={inputClass} rows={6} placeholder="Tuliskan misi per baris (Enter untuk poin baru)" />
                    <p className="text-xs text-gray-600 font-bold mt-2">*Gunakan tombol Enter untuk memisahkan poin misi.</p>
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={saving}
            className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
        </button>
      </form>
    </div>
  )
}