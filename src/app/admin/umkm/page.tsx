'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { UMKM } from '@/types'
import { Loader2, Plus, Trash2, Store, User, Phone, Image as ImageIcon, UploadCloud, X, Tag, Type } from 'lucide-react'
import Image from 'next/image'

export default function AdminUMKMPage() {
  const [data, setData] = useState<UMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Form State
  const [namaUmkm, setNamaUmkm] = useState('')
  const [pemilik, setPemilik] = useState('')
  const [kontak, setKontak] = useState('')
  const [kategori, setKategori] = useState('Makanan')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('umkm')
        .select('*')
        .order('id', { ascending: false })
      
      if (data) setData(data as UMKM[])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- DRAG & DROP ---
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0]
      if (f.type.startsWith('image/')) setFile(f)
      else alert('Hanya file gambar!')
    }
  }
  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  // ------------------

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Pilih foto produk terlebih dahulu')

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('umkm') // Pastikan bucket 'umkm' ada
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('umkm')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('umkm')
        .insert([{
          nama_umkm: namaUmkm,
          pemilik,
          kontak,
          kategori,
          deskripsi,
          foto_url: publicUrl,
          status: 'aktif'
        }])

      if (dbError) throw dbError

      // Reset Form
      setNamaUmkm(''); setPemilik(''); setKontak(''); setDeskripsi('');
      removeFile();
      fetchData();
      alert('UMKM berhasil ditambahkan!')

    } catch (error) {
      console.error('Error:', error)
      alert('Gagal upload. Pastikan bucket "umkm" sudah dibuat.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data UMKM ini?')) return
    try {
      await supabase.from('umkm').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
    try {
      await supabase.from('umkm').update({ status: newStatus }).eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola UMKM Desa</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} /> Tambah UMKM Baru
        </h2>
        
        <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Usaha/Produk</label>
              <div className="relative">
                <Store className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={namaUmkm}
                  onChange={e => setNamaUmkm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Contoh: Keripik Singkong Barokah"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={pemilik}
                  onChange={e => setPemilik(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="Nama pemilik usaha"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input 
                        type="text"
                        value={kontak}
                        onChange={e => setKontak(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="0812xxxx"
                        required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3 text-gray-400" size={18} />
                        <select 
                            value={kategori}
                            onChange={e => setKategori(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white appearance-none"
                        >
                            <option value="Makanan">Makanan</option>
                            <option value="Minuman">Minuman</option>
                            <option value="Kerajinan">Kerajinan</option>
                            <option value="Jasa">Jasa</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Produk</label>
              {!file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Klik atau Drag foto kesini</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <ImageIcon className="text-orange-600" />
                  <span className="text-sm truncate flex-1">{file.name}</span>
                  <button type="button" onClick={removeFile}><X size={18} className="text-red-500" /></button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea 
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24"
                placeholder="Jelaskan keunggulan produk..."
                required
              />
            </div>

            <button 
              disabled={uploading}
              type="submit" 
              className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 font-medium"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
              Simpan UMKM
            </button>
          </div>
        </form>
      </div>

      {/* List UMKM */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${item.status === 'aktif' ? 'border-transparent' : 'border-gray-200 opacity-75'}`}>
            <div className="relative h-48 bg-gray-100">
              {item.foto_url ? (
                <Image src={item.foto_url} alt={item.nama_umkm} fill className="object-cover" />
              ) : <div className="h-full flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}
              
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${item.status === 'aktif' ? 'bg-green-500' : 'bg-gray-500'}`}>
                    {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-1">{item.nama_umkm}</h3>
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">{item.kategori}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <User size={12} className="mr-1" /> {item.pemilik}
              </div>
              <div className="flex items-center text-xs text-gray-500 mb-3">
                <Phone size={12} className="mr-1" /> {item.kontak}
              </div>
              
              <div className="pt-3 border-t flex justify-between items-center">
                <button 
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${item.status === 'aktif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                    {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                  title="Hapus"
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