'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PerangkatDesa } from '@/types'
import { Loader2, Plus, Trash2, User, Briefcase, ListOrdered, Image as ImageIcon, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'

export default function AdminPerangkatPage() {
  const [data, setData] = useState<PerangkatDesa[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Form State
  const [nama, setNama] = useState('')
  const [jabatan, setJabatan] = useState('')
  const [urutan, setUrutan] = useState('1')
  const [file, setFile] = useState<File | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('perangkat_desa')
        .select('*')
        .order('urutan', { ascending: true })
      
      if (data) setData(data as PerangkatDesa[])
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
    if (!file) return alert('Pilih foto profil terlebih dahulu')

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('perangkat_desa')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('perangkat_desa')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('perangkat_desa')
        .insert([{
          nama_lengkap: nama,
          jabatan,
          urutan: parseInt(urutan),
          foto_url: publicUrl,
          status: 'aktif'
        }])

      if (dbError) throw dbError

      // Reset Form
      setNama(''); setJabatan(''); setUrutan(prev => (parseInt(prev) + 1).toString());
      removeFile();
      fetchData();
      alert('Perangkat desa berhasil ditambahkan!')

    } catch (error) {
      console.error('Error:', error)
      alert('Gagal upload. Pastikan bucket "perangkat_desa" sudah dibuat.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus perangkat desa ini?')) return
    try {
      await supabase.from('perangkat_desa').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
    try {
      await supabase.from('perangkat_desa').update({ status: newStatus }).eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // REUSABLE STYLES (Agar konsisten & mudah dibaca)
  const labelClass = "block text-sm font-bold text-black mb-2"
  const inputContainerClass = "relative"
  const iconClass = "absolute left-3 top-3 text-gray-600"
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-lg bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Kelola Perangkat Desa</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2 border-b pb-2">
          <Plus size={20} className="text-green-700" /> Tambah Anggota
        </h2>
        
        <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Nama Lengkap</label>
              <div className={inputContainerClass}>
                <User className={iconClass} size={18} />
                <input 
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className={inputClass}
                  placeholder="Nama beserta gelar"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Jabatan</label>
                    <div className={inputContainerClass}>
                        <Briefcase className={iconClass} size={18} />
                        <input 
                        type="text"
                        value={jabatan}
                        onChange={e => setJabatan(e.target.value)}
                        className={inputClass}
                        placeholder="Contoh: Kepala Desa"
                        required
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>No. Urut</label>
                    <div className={inputContainerClass}>
                        <ListOrdered className={iconClass} size={18} />
                        <input 
                        type="number"
                        value={urutan}
                        onChange={e => setUrutan(e.target.value)}
                        className={inputClass}
                        placeholder="1"
                        required
                        />
                    </div>
                    <p className="text-xs text-gray-600 font-bold mt-1">*Semakin kecil angka, semakin di atas.</p>
                </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Foto Profil</label>
              {!file ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-green-500 bg-green-50' : 'border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <UploadCloud className="mx-auto text-gray-500 mb-2" size={32} />
                  <p className="text-sm text-gray-700 font-medium">Klik atau Drag foto kesini</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <ImageIcon className="text-green-600" />
                  <span className="text-sm font-medium text-black truncate flex-1">{file.name}</span>
                  <button type="button" onClick={removeFile}><X size={18} className="text-red-600 hover:scale-110 transition-transform" /></button>
                </div>
              )}
            </div>

            <button 
              disabled={uploading}
              type="submit" 
              className="w-full bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 flex items-center justify-center gap-2 font-bold mt-2 shadow-md transition-transform active:scale-95"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              Simpan Anggota
            </button>
          </div>
        </form>
      </div>

      {/* List Perangkat */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((item) => (
          <div key={item.id} className={`bg-white rounded-xl shadow-md overflow-hidden border flex flex-col items-center p-6 transition-all hover:-translate-y-1 ${item.status === 'aktif' ? 'border-gray-200' : 'border-gray-200 opacity-75 bg-gray-50'}`}>
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4 border-4 border-gray-100 shadow-sm">
              {item.foto_url ? (
                <Image src={item.foto_url} alt={item.nama_lengkap} fill className="object-cover" />
              ) : <div className="h-full flex items-center justify-center"><User className="text-gray-400" size={32} /></div>}
            </div>
            
            <div className="text-center w-full">
                <span className="inline-block bg-gray-200 text-black font-bold text-xs px-2.5 py-1 rounded-full mb-2">
                    Urutan: {item.urutan}
                </span>
                <h3 className="font-bold text-lg text-black line-clamp-1">{item.nama_lengkap}</h3>
                <p className="text-green-700 font-bold text-sm mb-4">{item.jabatan}</p>
                
                <div className="pt-4 border-t border-gray-200 w-full flex justify-between items-center gap-2">
                    <button 
                        onClick={() => toggleStatus(item.id, item.status)}
                        className={`flex-1 text-xs font-bold py-2 rounded-lg transition-colors ${item.status === 'aktif' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                    >
                        {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                    </button>
                    <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
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