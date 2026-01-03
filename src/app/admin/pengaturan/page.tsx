'use client'

import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { ProfilDesa } from '@/types'
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
      // Ambil data baris pertama (karena cuma ada 1 profil)
      const { data, error } = await supabase
        .from('profil_desa')
        .select('*')
        .single() // .single() penting karena kita cuma mau 1 data
      
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
      // Update data (kita asumsikan ID=1 atau update row pertama yang ditemukan)
      // Supabase update tanpa where ID agak tricky, jadi kita update semua record (toh cuma 1)
      // Atau lebih aman ambil ID dulu, tapi karena single row, trik update ID=1 biasanya aman jika dari awal sudah insert.
      
      // Cara paling aman: Update row yang ID-nya ada (biasanya 1)
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
        .eq('id', 1) // Asumsi ID 1 (sesuai insert awal)

      if (error) throw error
      alert('Pengaturan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving:', error)
      alert('Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Memuat data...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pengaturan Profil Desa</h1>
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-8">
        
        {/* Identitas Dasar */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building size={20} className="text-green-600" /> Identitas & Kontak
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Nama Desa</label>
                    <input type="text" value={namaDesa} onChange={e => setNamaDesa(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">No. Telepon / WA</label>
                    <input type="text" value={telepon} onChange={e => setTelepon(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Alamat Lengkap</label>
                    <textarea value={alamat} onChange={e => setAlamat(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2 h-20" />
                </div>
            </div>
        </div>

        <hr />

        {/* Sejarah */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History size={20} className="text-blue-600" /> Sejarah Desa
            </h3>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-1">Cerita Sejarah</label>
                <textarea value={sejarah} onChange={e => setSejarah(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2 h-40" />
            </div>
        </div>

        <hr />

        {/* Visi Misi */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen size={20} className="text-purple-600" /> Visi & Misi
            </h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Visi</label>
                    <textarea value={visi} onChange={e => setVisi(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2 h-20" placeholder="Visi desa..." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-1">Misi</label>
                    <textarea value={misi} onChange={e => setMisi(e.target.value)} className="w-full border border-gray-400 rounded-lg px-3 py-2 h-40" placeholder="Tuliskan misi per baris (Enter untuk poin baru)" />
                    <p className="text-xs text-gray-500 mt-1">*Gunakan tombol Enter untuk memisahkan poin misi.</p>
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={saving}
            className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2 shadow-md"
        >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
        </button>
      </form>
    </div>
  )
}