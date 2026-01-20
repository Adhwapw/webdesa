'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { Banner } from '@/types'
import { Loader2, Plus, Trash2, CheckCircle, Image as ImageIcon, UploadCloud, X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal' // Import Modal

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  
  // State untuk Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [judul, setJudul] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      toast.error('Gagal memuat data banner')
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
      else toast.error('Hanya file gambar!')
    }
  }
  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Pilih gambar terlebih dahulu')
    if (file.size > 5 * 1024 * 1024) return toast.error('Maksimal 5MB.')
    if (!file.type.startsWith('image/')) return toast.error('File harus gambar.')

    setUploading(true)
    const toastId = toast.loading('Mengupload banner...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath)

      const { error: dbError } = await supabase.from('banners').insert([{
        judul, deskripsi, foto_url: publicUrl, status: 'non-aktif' 
      }])
      if (dbError) throw dbError

      setJudul(''); setDeskripsi(''); removeFile(); fetchBanners()
      toast.dismiss(toastId); toast.success('Banner berhasil ditambahkan!')
    } catch (error) {
      toast.dismiss(toastId); toast.error('Gagal upload banner.')
    } finally {
      setUploading(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      if (currentStatus === 'non-aktif') {
        await supabase.from('banners').update({ status: 'non-aktif' }).neq('id', 0) 
      }
      const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
      await supabase.from('banners').update({ status: newStatus }).eq('id', id)
      fetchBanners()
      toast.success(`Status diubah: ${newStatus}`)
    } catch (error) {
      toast.error('Gagal mengubah status')
    }
  }

  // --- LOGIKA DELETE BARU ---
  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    try {
      await supabase.from('banners').delete().eq('id', deleteId)
      fetchBanners()
      toast.success('Banner berhasil dihapus')
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error('Gagal menghapus banner')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div>
      <DeleteModal 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Banner Depan</h1>

      {/* Form Upload (Sama seperti sebelumnya) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg text-green-900 font-semibold mb-4 flex items-center gap-2"><Plus size={20} /> Tambah Banner Baru</h2>
        <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Judul Utama</label>
                    <input type="text" value={judul} onChange={e => setJudul(e.target.value)} className="w-full border border-gray-400 p-2.5 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 outline-none" placeholder="Contoh: Selamat Datang" required />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Upload Gambar</label>
                    {!file ? (
                        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-400 hover:bg-gray-50'}`}>
                          <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                          <UploadCloud className="mx-auto text-gray-500 mb-2" size={32} />
                          <p className="text-sm text-gray-700 font-medium">Klik atau Drag foto kesini</p>
                          <p className="text-xs text-red-500 mt-1 font-bold">*Maksimal 5MB</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg shadow-sm">
                          <ImageIcon className="text-green-600" />
                          <span className="text-sm font-medium text-black truncate flex-1">{file.name}</span>
                          <button type="button" onClick={removeFile}><X size={18} className="text-red-600 hover:scale-110" /></button>
                        </div>
                      )}
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Deskripsi Singkat</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)} className="w-full border border-gray-400 p-2.5 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-green-500 outline-none" rows={2} placeholder='Contoh: Desa Yang sangat Indah'/>
            </div>
            <button disabled={uploading} type="submit" className={`bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold shadow-sm ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />} {uploading ? 'Sedang Mengupload...' : 'Upload Banner'}
            </button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${item.status === 'aktif' ? 'border-green-500' : 'border-transparent'}`}>
                <div className="relative h-48 bg-gray-100">
                    {item.foto_url ? <Image src={item.foto_url} alt={item.judul} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon /></div>}
                    {item.status === 'aktif' && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md"><CheckCircle size={12} /> Aktif</div>}
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{item.judul}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1 mb-4 h-10">{item.deskripsi}</p>
                    <div className="flex justify-between items-center border-t pt-4">
                        <button onClick={() => toggleStatus(item.id, item.status)} className={`text-sm font-medium flex items-center gap-1 ${item.status === 'aktif' ? 'text-orange-600' : 'text-green-600'}`}>
                            {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                        </button>
                        <button onClick={() => openDeleteModal(item.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
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