'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { PerangkatDesa } from '@/types'
import { Loader2, Plus, Trash2, User, Briefcase, ListOrdered, Image as ImageIcon, UploadCloud, X, Edit2, CheckCircle, XCircle } from 'lucide-react'
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
  
  // Ref
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

  // --- HANDLERS ---
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

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!file) return alert('Pilih foto profil terlebih dahulu')
    if (file.size > 2 * 1024 * 1024) return alert('Ukuran foto maksimal 2MB')

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

      setNama(''); setJabatan(''); setUrutan(prev => (parseInt(prev) + 1).toString());
      removeFile();
      fetchData();
      alert('Perangkat desa berhasil ditambahkan!')

    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menyimpan. Pastikan bucket storage "perangkat_desa" sudah dibuat.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return
    try {
      await supabase.from('perangkat_desa').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
      await supabase.from('perangkat_desa').update({ status: newStatus }).eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Styles Updated: Menambahkan 'text-black' dan 'bg-white' agar input terbaca jelas
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
  const iconClass = "absolute left-3 top-3 text-gray-500"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Perangkat Desa</h1>

      {/* --- FORM INPUT --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          <Plus size={20} className="text-blue-600" /> Tambah Perangkat Baru
        </h2>
        
        <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Nama Lengkap & Gelar</label>
              <div className="relative">
                <User className={iconClass} size={18} />
                <input 
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: H. Ahmad Zaki, S.Kom"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Jabatan</label>
                    <div className="relative">
                        <Briefcase className={iconClass} size={18} />
                        <input 
                            type="text"
                            value={jabatan}
                            onChange={e => setJabatan(e.target.value)}
                            className={inputClass}
                            placeholder="Contoh: Kaur Keuangan"
                            list="jabatan-list"
                            required
                        />
                        <datalist id="jabatan-list">
                            <option value="Kepala Desa" />
                            <option value="Sekretaris Desa" />
                            <option value="Kaur Keuangan" />
                            <option value="Kaur Perencanaan" />
                            <option value="Kasi Pemerintahan" />
                            <option value="Kasi Pelayanan" />
                            <option value="Kepala Dusun 1" />
                        </datalist>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-1">
                        *Gunakan nama baku (Kaur/Kasi) agar struktur otomatis rapi.
                    </p>
                </div>
                <div>
                    <label className={labelClass}>No. Urut (Kiri-Kanan)</label>
                    <div className="relative">
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
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600">Klik atau Drag foto kesini</p>
                  <p className="text-xs text-red-500 mt-1">*Max 2MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <ImageIcon className="text-blue-600" />
                  <span className="text-sm font-medium text-black truncate flex-1">{file.name}</span>
                  <button type="button" onClick={removeFile} className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors">
                      <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <button 
              disabled={uploading}
              type="submit" 
              className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-bold shadow-sm transition-all ${uploading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              {uploading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>

      {/* --- LIST DATA --- */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.map((item) => (
          <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center transition-all ${item.status === 'aktif' ? 'border-gray-200' : 'border-red-200 bg-red-50 opacity-75'}`}>
            
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-3 border border-gray-100">
              {item.foto_url ? (
                <Image src={item.foto_url} alt={item.nama_lengkap} fill className="object-cover" />
              ) : <User className="w-full h-full p-4 text-gray-400" />}
            </div>
            
            <div className="text-center w-full mb-4">
                <div className="flex justify-center items-center gap-2 mb-1">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Urut: {item.urutan}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-800 line-clamp-1">{item.nama_lengkap}</h3>
                <p className="text-blue-600 text-sm font-medium">{item.jabatan}</p>
            </div>
            
            <div className="mt-auto w-full flex gap-2 pt-3 border-t border-gray-100">
                <button 
                    onClick={() => toggleStatus(item.id, item.status)}
                    className={`flex-1 flex items-center justify-center gap-1 text-xs font-bold py-2 rounded-lg transition-colors ${item.status === 'aktif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                    {item.status === 'aktif' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
                <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Permanen"
                >
                    <Trash2 size={18} />
                </button>
            </div>
          </div>
        ))}
        
        {data.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-gray-400">
                <User size={48} className="mx-auto mb-2 opacity-20" />
                <p>Belum ada data perangkat desa.</p>
            </div>
        )}
      </div>
    </div>
  )
}