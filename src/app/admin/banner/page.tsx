'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { compressImage } from '@/lib/compression' // Import helper kompresi yang baru kita buat
import { Loader2, Plus, Trash2, CheckCircle, Image as ImageIcon, UploadCloud, X, XCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

// --- 1. SKEMA VALIDASI (ZOD) ---
const bannerSchema = z.object({
  judul: z.string().min(3, "Judul banner minimal 3 karakter"),
  deskripsi: z.string().optional(),
})

type BannerFormValues = z.infer<typeof bannerSchema>

// Tipe Data Database
interface Banner {
  id: number
  judul: string
  deskripsi: string | null
  foto_url: string
  status: 'aktif' | 'non-aktif'
  created_at?: string
}

export default function AdminBannerPage() {
  const [data, setData] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State Upload
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State Modal Hapus
  const [deleteState, setDeleteState] = useState<{ show: boolean; id: number | null; foto_url: string | null; loading: boolean }>({
    show: false, id: null, foto_url: null, loading: false
  })

  // --- 2. SETUP REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners') // Pastikan nama tabel di Supabase adalah 'banners'
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setData(data as Banner[])
    } catch (error) {
      toast.error('Gagal memuat data banner')
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER FILE (DENGAN KOMPRESI) ---
  const processFile = async (selectedFile: File) => {
    // 1. Validasi Tipe & Ukuran Awal
    if (!selectedFile.type.startsWith('image/')) {
        toast.error('File harus berupa gambar!')
        return
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // Limit awal 10MB
        toast.error('Ukuran file terlalu besar (Max 10MB)')
        return
    }

    const toastId = toast.loading('Memproses & Mengompres gambar...')
    try {
        // 2. Kompresi
        const compressed = await compressImage(selectedFile)
        
        // 3. Set State
        setFile(compressed)
        setPreviewUrl(URL.createObjectURL(compressed))
        toast.success(`Kompresi: ${(selectedFile.size/1024).toFixed(0)}KB -> ${(compressed.size/1024).toFixed(0)}KB`, { id: toastId })
    } catch (error) {
        toast.error('Gagal memproses gambar', { id: toastId })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processFile(f)
  }

  const removeFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- 3. SUBMIT HANDLER ---
  const onSubmit = async (values: BannerFormValues) => {
    if (!file) {
        toast.error('Wajib upload gambar banner!')
        return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Mengupload data...')

    try {
      // 1. Upload ke Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath)

      // 2. Insert ke Database
      const { error: dbError } = await supabase.from('banners').insert([{
        judul: values.judul,
        deskripsi: values.deskripsi,
        foto_url: publicUrl,
        status: 'non-aktif' // Default non-aktif agar aman
      }])

      if (dbError) throw dbError

      toast.success('Banner berhasil ditambahkan!', { id: toastId })
      reset()
      removeFile()
      fetchBanners()

    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan banner', { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- DELETE LOGIC ---
  const confirmDelete = (id: number, foto_url: string | null) => {
    setDeleteState({ show: true, id, foto_url, loading: false })
  }

  const handleDelete = async () => {
    if (!deleteState.id) return
    setDeleteState(prev => ({ ...prev, loading: true }))

    try {
        // Hapus file di storage dulu
        if (deleteState.foto_url) {
            const fileName = deleteState.foto_url.split('/').pop()
            if (fileName) await supabase.storage.from('banners').remove([fileName])
        }
        // Hapus data di DB
        await supabase.from('banners').delete().eq('id', deleteState.id)
        
        toast.success('Banner dihapus')
        fetchBanners()
        setDeleteState({ show: false, id: null, foto_url: null, loading: false })
    } catch (error) {
        toast.error('Gagal menghapus')
        setDeleteState(prev => ({ ...prev, loading: false }))
    }
  }

  // --- TOGGLE STATUS (LOGIKA SATU AKTIF) ---
  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      // Jika user ingin mengaktifkan banner ini, matikan semua banner lain dulu
      if (currentStatus === 'non-aktif') {
         await supabase.from('banners').update({ status: 'non-aktif' }).neq('id', 0) 
      }
      
      const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
      const { error } = await supabase.from('banners').update({ status: newStatus }).eq('id', id)
      
      if (error) throw error

      fetchBanners()
      toast.success(newStatus === 'aktif' ? 'Banner Diaktifkan (Yang lain dimatikan)' : 'Banner Dinonaktifkan')
    } catch (error) {
      toast.error('Gagal mengubah status')
    }
  }

  // Styles
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
  const errorClass = "text-red-500 text-xs mt-1 font-medium"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Banner Depan</h1>

      {/* --- FORM UPLOAD --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
            <Plus size={20} className="text-green-600" /> Tambah Banner Baru
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-4">
                <div>
                    <label className={labelClass}>Judul Utama</label>
                    <input {...register('judul')} className={inputClass} placeholder="Contoh: Selamat Datang" />
                    {errors.judul && <p className={errorClass}>{errors.judul.message}</p>}
                </div>
                <div>
                    <label className={labelClass}>Deskripsi Singkat (Opsional)</label>
                    <textarea {...register('deskripsi')} className={inputClass} rows={3} placeholder="Keterangan tambahan..." />
                </div>
                
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className={`w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 font-bold shadow-sm transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <UploadCloud size={20} />} 
                    {isSubmitting ? 'Mengupload...' : 'Upload Banner'}
                </button>
            </div>

            <div className="md:col-span-2">
                <label className={labelClass}>Gambar Banner</label>
                {!previewUrl ? (
                    <div 
                        onDragOver={handleDragOver} 
                        onDragLeave={handleDragLeave} 
                        onDrop={handleDrop} 
                        onClick={() => fileInputRef.current?.click()} 
                        className={`h-full min-h-[200px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}
                    >
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <UploadCloud className="mx-auto text-gray-400 mb-2" size={48} />
                        <p className="text-sm text-gray-600 font-medium">Klik atau Drag foto kesini</p>
                        <p className="text-xs text-green-600 mt-1 font-bold">Otomatis dikompres &lt; 500KB</p>
                    </div>
                ) : (
                    <div className="h-full min-h-[200px] relative rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                        {/* Preview menggunakan Image Next.js */}
                        <Image 
                            src={previewUrl} 
                            alt="Preview" 
                            fill 
                            className="object-cover" 
                            unoptimized // Penting untuk blob preview
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={removeFile} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-red-700">
                                <X size={16} /> Ganti Gambar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </form>
      </div>

      {/* --- LIST BANNERS --- */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={32} /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all hover:shadow-md ${item.status === 'aktif' ? 'border-green-500 ring-1 ring-green-500' : 'border-transparent'}`}>
                    <div className="relative h-48 bg-gray-100">
                        {item.foto_url ? (
                            <Image 
                                src={item.foto_url} 
                                alt={item.judul} 
                                fill 
                                className="object-cover" 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Fix warning sizes
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={48} opacity={0.5} /></div>
                        )}
                        
                        {item.status === 'aktif' && (
                            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg font-bold z-10">
                                <CheckCircle size={12} /> Sedang Tayang
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        <h3 className="font-bold text-gray-800 line-clamp-1 text-lg mb-1">{item.judul}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-4">{item.deskripsi || "Tidak ada deskripsi."}</p>
                        
                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                            <button 
                                onClick={() => toggleStatus(item.id, item.status)} 
                                className={`flex-1 flex items-center justify-center gap-2 text-sm font-bold py-2 rounded-lg transition-colors ${item.status === 'aktif' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                            >
                                {item.status === 'aktif' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                {item.status === 'aktif' ? 'Sembunyikan' : 'Tayangkan'}
                            </button>
                            <button 
                                onClick={() => confirmDelete(item.id, item.foto_url)} 
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Hapus Permanen"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {data.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Belum ada banner. Silakan upload gambar baru.</p>
                </div>
            )}
        </div>
      )}

      {/* --- MODAL HAPUS --- */}
      <DeleteModal 
        isOpen={deleteState.show}
        onClose={() => setDeleteState(prev => ({ ...prev, show: false }))}
        onConfirm={handleDelete}
        loading={deleteState.loading}
        title="Hapus Banner?"
        message="Banner ini akan dihapus permanen dari sistem."
      />
    </div>
  )
}