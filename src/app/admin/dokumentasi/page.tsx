'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { stripHtml } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Dokumentasi } from '@/types'
import { Loader2, Plus, Trash2, Calendar, Type, Image as ImageIcon, UploadCloud, X, Tag } from 'lucide-react'
import Image from 'next/image'
import TextEditor from '@/components/TextEditor'
import toast from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal' // 1. Import Modal

export default function AdminDokumentasiPage() {
  const [data, setData] = useState<Dokumentasi[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // 2. State untuk Modal Delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [judul, setJudul] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [kategori, setKategori] = useState('Kegiatan')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)

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
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }


  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      const f = e.dataTransfer.files[0]
      if (f.type.startsWith('image/')) setFile(f)
      else toast.error('Hanya file gambar!')
    }
  }
  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()

    if (!file) return toast.error('Pilih foto kegiatan terlebih dahulu')

    // Validasi 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar! Maksimal 5MB.')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar.')
      return
    }

    setUploading(true)
    const toastId = toast.loading('Mempublikasikan berita...')

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
          tanggal,
          kategori,
          deskripsi,
          foto_url: publicUrl,
          status: 'aktif'
        }])

      if (dbError) throw dbError

      setJudul('')
      setTanggal('')
      setDeskripsi('')
      removeFile()
      fetchData()

      toast.dismiss(toastId)
      toast.success('Berita berhasil dipublikasikan!')

    } catch (error) {
      console.error('Error:', error)
      toast.dismiss(toastId)
      toast.error('Gagal mempublikasikan berita.')
    } finally {
      setUploading(false)
    }
  }

  // 3. Logic Hapus dengan Modal
  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    setDeleteLoading(true)
    try {
      await supabase.from('dokumentasi').delete().eq('id', deleteId)
      fetchData()
      toast.success('Data berhasil dihapus')
      setIsDeleteOpen(false) // Tutup modal setelah berhasil
    } catch (error) {
      toast.error('Gagal menghapus data')
    } finally {
      setDeleteLoading(false)
    }
  }

  const labelClass = "block text-sm font-bold text-black mb-2"
  const inputContainerClass = "relative"
  const iconClass = "absolute left-3 top-3 text-gray-600"
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-lg bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"

  return (
    <div>
      {/* 4. Pasang Komponen Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />

      <h1 className="text-2xl font-bold text-black mb-6">Kelola Dokumentasi & Berita</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold text-black mb-6 flex items-center gap-2 border-b pb-2">
          <Plus size={20} className="text-green-700" /> Tambah Kegiatan Baru
        </h2>

        <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-8">

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Judul Kegiatan</label>
              <div className={inputContainerClass}>
                <Type className={iconClass} size={18} />
                <input
                  type="text"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Kerja Bakti Desa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tanggal</label>
                <div className={inputContainerClass}>
                  <Calendar className={iconClass} size={18} />
                  <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Kategori</label>
                <div className={inputContainerClass}>
                  <Tag className={iconClass} size={18} />
                  <select
                    value={kategori}
                    onChange={e => setKategori(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Berita">Berita</option>
                    <option value="Pembangunan">Pembangunan</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Foto Kegiatan</label>
              {!file ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-400 hover:bg-gray-50'
                    }`}
                >
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                  <UploadCloud className="mx-auto text-gray-500 mb-2" size={32} />
                  <p className="text-sm text-gray-700 font-medium">Klik atau Drag foto kesini</p>
                  <p className="text-xs text-red-500 mt-1 font-bold">*Maksimal 5MB</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
                  <ImageIcon className="text-green-600" />
                  <span className="text-sm font-medium text-black truncate flex-1">{file.name}</span>
                  <button type="button" onClick={removeFile}><X size={18} className="text-red-600 hover:scale-110 transition-transform" /></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col h-full">
            <label className={labelClass}>Isi Artikel / Deskripsi Lengkap</label>
            <div className="flex-1">
              <TextEditor
                value={deskripsi}
                onChange={setDeskripsi}
              />
            </div>

            <button
              disabled={uploading}
              type="submit"
              className={`w-full bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 flex items-center justify-center gap-2 font-bold mt-4 shadow-md transition-transform active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              {uploading ? 'Mengupload...' : 'Publikasikan Berita'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100">
              {item.foto_url ? (
                <Image src={item.foto_url} alt={item.judul} fill className="object-cover" />
              ) : <div className="h-full flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}

              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                {new Date(item.tanggal).toLocaleDateString('id-ID')}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-auto">
                <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2">
                  {item.kategori}
                </span>
                <h3 className="font-bold text-lg text-black mb-2 line-clamp-2">{item.judul}</h3>

                <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">
                  {stripHtml(item.deskripsi,8)}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 flex justify-end">
                {/* 5. Ubah tombol Hapus untuk memanggil openDeleteModal */}
                <button
                  onClick={() => openDeleteModal(item.id)}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-600 text-sm font-medium transition-colors p-2 hover:bg-red-50 rounded"
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