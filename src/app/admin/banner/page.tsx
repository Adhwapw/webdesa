'use client'

import { useState, useEffect, FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Banner } from '@/types'
import { Loader2, Plus, Trash2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Form State
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setBanners(data as Banner[])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Pilih gambar terlebih dahulu')

    setUploading(true)
    try {
      // 1. Upload Gambar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('banners') // Pastikan bucket 'banners' sudah dibuat di Supabase Storage
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Dapat Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('banners')
        .getPublicUrl(filePath)

      // 3. Simpan ke Database
      const { error: dbError } = await supabase
        .from('banners')
        .insert([{
          judul,
          deskripsi,
          foto_url: publicUrl,
          status: 'non-aktif' // Default non-aktif
        }])

      if (dbError) throw dbError

      // Reset Form & Refresh
      setJudul('')
      setDeskripsi('')
      setFile(null)
      fetchBanners()
      alert('Banner berhasil ditambahkan!')

    } catch (error) {
      console.error('Error:', error)
      alert('Gagal mengupload banner. Pastikan bucket "banners" sudah ada di Supabase Storage.')
    } finally {
      setUploading(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      // Jika ingin mengaktifkan, non-aktifkan yang lain dulu (opsional, agar cuma 1 yg aktif)
      if (currentStatus === 'non-aktif') {
        await supabase
          .from('banners')
          .update({ status: 'non-aktif' })
          .neq('id', 0) // Update semua
      }

      // Update status target
      const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
      await supabase.from('banners').update({ status: newStatus }).eq('id', id)
      
      fetchBanners()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (id: number, foto_url: string | null) => {
    if (!confirm('Yakin ingin menghapus banner ini?')) return

    try {
        // Hapus data dari DB
        await supabase.from('banners').delete().eq('id', id)
        
        // Hapus gambar dari Storage (Opsional, agar bersih)
        // Logic penghapusan storage bisa ditambahkan di sini jika perlu

        fetchBanners()
    } catch (error) {
        console.error('Error deleting:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Banner Depan</h1>

      {/* Form Tambah Banner */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg text-green-900 font-semibold mb-4 flex items-center gap-2">
            <Plus size={20} /> Tambah Banner Baru
        </h2>
<form onSubmit={handleUpload} className="space-y-4">
    <div className="grid md:grid-cols-2 gap-4">
        <div>
            {/* LABEL TEBAL & HITAM */}
            <label className="block text-sm font-bold text-gray-900 mb-2">Judul Utama</label>
            <input 
                type="text" 
                value={judul}
                onChange={e => setJudul(e.target.value)}
                // BORDER LEBIH TEGAS (gray-400) & TEKS HITAM
                className="w-full border border-gray-400 p-2.5 rounded-lg text-gray-900 font-medium placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Contoh: Selamat Datang di Desa Citamiang"
                required
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Upload Gambar</label>
            <input 
                type="file" 
                accept="image/*"
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full border border-gray-400 p-2 rounded-lg text-gray-900 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                required
            />
        </div>
    </div>
    <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat</label>
        <textarea 
            value={deskripsi}
            onChange={e => setDeskripsi(e.target.value)}
            className="w-full border border-gray-400 p-2.5 rounded-lg text-gray-900 font-medium placeholder:text-gray-500 focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Contoh: Desa yang Asri, Maju, dan Sejahtera"
            rows={2}
        />
    </div>
    <button 
        disabled={uploading}
        type="submit" 
        className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold shadow-sm"
    >
        {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />}
        Upload Banner
    </button>
</form>
      </div>

      {/* List Banner */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${item.status === 'aktif' ? 'border-green-500' : 'border-transparent'}`}>
                <div className="relative h-48 bg-gray-100">
                    {item.foto_url ? (
                        <Image src={item.foto_url} alt={item.judul} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
                    )}
                    
                    {item.status === 'aktif' && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <CheckCircle size={12} /> Aktif
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{item.judul}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1 mb-4 h-10">{item.deskripsi}</p>
                    
                    <div className="flex justify-between items-center border-t pt-4">
                        <button 
                            onClick={() => toggleStatus(item.id, item.status)}
                            className={`text-sm font-medium flex items-center gap-1 ${item.status === 'aktif' ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                            {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id, item.foto_url)}
                            className="text-red-500 hover:text-red-700 p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  )
}