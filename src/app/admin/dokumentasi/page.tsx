'use client'

import { useState, useEffect, FormEvent, useRef } from 'react' // Tambah useRef
import { supabase } from '@/lib/supabase'
import { Dokumentasi } from '@/types'
import { Loader2, Plus, Trash2, Calendar, Image as ImageIcon, Type, UploadCloud, X } from 'lucide-react' // Tambah icon
import Image from 'next/image'

export default function AdminDokumentasiPage() {
  const [data, setData] = useState<Dokumentasi[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false) // State untuk efek drag

  // Form State
  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [kategori, setKategori] = useState('Kegiatan')
  const [file, setFile] = useState<File | null>(null)
  
  // Ref untuk input file hidden
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('dokumentasi')
        .select('*')
        .order('tanggal', { ascending: false })
      
      if (data) setData(data as Dokumentasi[])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- LOGIC DRAG AND DROP ---
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    // Ambil file yang didrop
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      // Validasi tipe file (hanya gambar)
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile)
      } else {
        alert('Mohon upload file gambar saja (JPG/PNG).')
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  // ---------------------------

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Pilih foto terlebih dahulu')

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('dokumentasi')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('dokumentasi')
        .getPublicUrl(filePath)

      const { error: dbError } = await supabase
        .from('dokumentasi')
        .insert([{
          judul,
          deskripsi,
          tanggal,
          kategori,
          foto_url: publicUrl
        }])

      if (dbError) throw dbError

      setJudul('')
      setDeskripsi('')
      setTanggal('')
      removeFile() // Reset file
      fetchData()
      alert('Dokumentasi berhasil ditambahkan!')

    } catch (error) {
      console.error('Error:', error)
      alert('Gagal upload. Pastikan bucket "dokumentasi" sudah dibuat.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus dokumentasi ini?')) return
    try {
      await supabase.from('dokumentasi').delete().eq('id', id)
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Dokumentasi</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} /> Tambah Kegiatan Baru
        </h2>
        
        <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-6">
          {/* Kolom Kiri: Input Text */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kegiatan</label>
              <div className="relative">
                <Type className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="text"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Contoh: Kerja Bakti Desa"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pelaksanaan</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="Kegiatan">Kegiatan</option>
                <option value="Pembangunan">Pembangunan</option>
                <option value="Sosial">Sosial</option>
                <option value="Rapat">Rapat</option>
              </select>
            </div>
          </div>

          {/* Kolom Kanan: Drag & Drop + Deskripsi */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Foto</label>
              
              {!file ? (
                // AREA DRAG & DROP (Muncul jika belum ada file)
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? 'border-green-500 bg-green-50 scale-[1.02]' 
                      : 'border-gray-300 hover:bg-gray-50 hover:border-green-400'
                  }`}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className={`p-3 rounded-full ${isDragging ? 'bg-green-200 text-green-700' : 'bg-gray-100'}`}>
                      <UploadCloud size={24} />
                    </div>
                    <p className="font-medium text-sm">
                      <span className="text-green-600 font-semibold">Klik untuk upload</span> atau drag foto kesini
                    </p>
                    <p className="text-xs text-gray-400">PNG, JPG, JPEG (Max. 5MB)</p>
                  </div>
                </div>
              ) : (
                // PREVIEW FILE (Muncul setelah file dipilih)
                <div className="relative border rounded-lg p-4 flex items-center gap-3 bg-green-50 border-green-200 animate-fade-in">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <ImageIcon className="text-green-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea 
                value={deskripsi}
                onChange={e => setDeskripsi(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                placeholder="Ceritakan detail kegiatannya..."
                required
              />
            </div>

            <button 
              disabled={uploading}
              type="submit" 
              className="w-full bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-medium shadow-md transition-all active:scale-[0.98]"
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
              Simpan Dokumentasi
            </button>
          </div>
        </form>
      </div>

      {/* List Data (Grid Card) */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 group hover:shadow-md transition-all">
            <div className="relative h-48 bg-gray-100">
              {item.foto_url ? (
                <Image src={item.foto_url} alt={item.judul} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>
              )}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-gray-600 shadow-sm">
                {item.kategori}
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <h3 className="font-bold text-gray-800 line-clamp-1 mb-2">{item.judul}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{item.deskripsi}</p>
              
              <div className="pt-3 border-t flex justify-end">
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  <Trash2 size={16} /> Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}