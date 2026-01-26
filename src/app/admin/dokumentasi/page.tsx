'use client'

import { useState, useEffect, useRef } from 'react'
import { stripHtml } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { compressImage } from '@/lib/compression' // Import helper kompresi
import { Loader2, Plus, Trash2, Calendar, Type, Image as ImageIcon, UploadCloud, X, Tag, Edit2, Save } from 'lucide-react'
import Image from 'next/image'
import TextEditor from '@/components/TextEditor'
import toast from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

// --- 1. SKEMA VALIDASI (ZOD) ---
const dokumentasiSchema = z.object({
  judul: z.string().min(5, "Judul kegiatan minimal 5 karakter"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  kategori: z.string().min(1, "Pilih kategori"),
  deskripsi: z.string().min(20, "Deskripsi/Artikel minimal 20 karakter"),
})

type DokumentasiFormValues = z.infer<typeof dokumentasiSchema>

// Tipe Data Database
interface Dokumentasi extends DokumentasiFormValues {
  id: number
  foto_url: string | null
  created_at?: string
}

export default function AdminDokumentasiPage() {
  const [data, setData] = useState<Dokumentasi[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State Edit & Upload
  const [editingId, setEditingId] = useState<number | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State Modal Hapus
  const [deleteState, setDeleteState] = useState<{ show: boolean; id: number | null; foto_url: string | null; loading: boolean }>({
    show: false, id: null, foto_url: null, loading: false
  })

  // --- 2. SETUP REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<DokumentasiFormValues>({
    resolver: zodResolver(dokumentasiSchema),
    defaultValues: {
      kategori: 'Kegiatan', // Default value
      tanggal: new Date().toISOString().split('T')[0] // Default hari ini
    }
  })

  // Watch deskripsi agar TextEditor bisa sinkron
  const deskripsiValue = watch("deskripsi")

  // Register deskripsi manual karena ini custom component (TextEditor)
  useEffect(() => {
    register("deskripsi")
  }, [register])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('dokumentasi')
        .select('*')
        .order('tanggal', { ascending: false })

      if (error) throw error
      setData(data as Dokumentasi[])
    } catch (error) {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER FILE DENGAN KOMPRESI ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
        // 1. Validasi Awal
        if (!selectedFile.type.startsWith('image/')) {
            toast.error('File harus berupa gambar')
            return
        }
        if (selectedFile.size > 10 * 1024 * 1024) { // Limit 10MB sebelum kompresi
            toast.error('File terlalu besar (Max 10MB)')
            return
        }

        const toastId = toast.loading('Mengompres gambar...')

        try {
            // 2. Proses Kompresi
            const compressed = await compressImage(selectedFile)
            
            // 3. Simpan ke State
            setFile(compressed)
            setPreviewUrl(URL.createObjectURL(compressed))
            
            toast.success(`Kompresi: ${(selectedFile.size/1024).toFixed(0)}KB -> ${(compressed.size/1024).toFixed(0)}KB`, { id: toastId })
        } catch (error) {
            toast.error('Gagal memproses gambar', { id: toastId })
        }
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- 3. HANDLER EDIT ---
  const handleEdit = (item: Dokumentasi) => {
    setEditingId(item.id)
    setValue('judul', item.judul)
    setValue('tanggal', item.tanggal)
    setValue('kategori', item.kategori)
    setValue('deskripsi', item.deskripsi) // Isi TextEditor

    if (item.foto_url) {
      setPreviewUrl(item.foto_url)
    } else {
      setPreviewUrl(null)
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    reset()
    clearFile()
    // Reset default date
    setValue('tanggal', new Date().toISOString().split('T')[0])
  }

  // --- 4. SUBMIT HANDLER ---
  const onSubmit = async (values: DokumentasiFormValues) => {
    // Validasi Foto: Wajib ada foto jika Mode Tambah Baru
    if (!editingId && !file) {
      toast.error('Wajib upload foto kegiatan!')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Menyimpan data...')

    try {
      let finalFotoUrl = previewUrl

      // Upload Foto Baru (File yang sudah dikompres)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('dokumentasi').upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('dokumentasi').getPublicUrl(filePath)
        finalFotoUrl = publicUrl
      }

      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from('dokumentasi')
          .update({
            judul: values.judul,
            tanggal: values.tanggal,
            kategori: values.kategori,
            deskripsi: values.deskripsi,
            foto_url: finalFotoUrl
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('Berita berhasil diperbarui!', { id: toastId })

      } else {
        // INSERT
        const { error } = await supabase
          .from('dokumentasi')
          .insert([{
            judul: values.judul,
            tanggal: values.tanggal,
            kategori: values.kategori,
            deskripsi: values.deskripsi,
            foto_url: finalFotoUrl,
            status: 'aktif'
          }])

        if (error) throw error
        toast.success('Berita berhasil dipublikasikan!', { id: toastId })
      }

      handleCancel()
      fetchData()

    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan data.', { id: toastId })
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
      if (deleteState.foto_url) {
        const fileName = deleteState.foto_url.split('/').pop()
        if (fileName) await supabase.storage.from('dokumentasi').remove([fileName])
      }
      await supabase.from('dokumentasi').delete().eq('id', deleteState.id)

      toast.success('Data berhasil dihapus')
      fetchData()
      setDeleteState({ show: false, id: null, foto_url: null, loading: false })
    } catch (error) {
      toast.error('Gagal menghapus data')
      setDeleteState(prev => ({ ...prev, loading: false }))
    }
  }

  // Styles
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"
  const inputContainerClass = "relative"
  const iconClass = "absolute left-3 top-3 text-gray-500"
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
  const errorClass = "text-red-500 text-xs mt-1 font-medium"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Dokumentasi & Berita</h1>

      {/* --- FORM CARD --- */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border mb-8 transition-all ${editingId ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200'}`}>
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
          {editingId ? <Edit2 size={20} className="text-orange-600" /> : <Plus size={20} className="text-green-700" />}
          {editingId ? 'Edit Kegiatan/Berita' : 'Tambah Kegiatan Baru'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Judul */}
            <div>
              <label className={labelClass}>Judul Kegiatan</label>
              <div className={inputContainerClass}>
                <Type className={iconClass} size={18} />
                <input
                  {...register('judul')}
                  type="text"
                  className={inputClass}
                  placeholder="Contoh: Kerja Bakti Desa"
                />
              </div>
              {errors.judul && <p className={errorClass}>{errors.judul.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal */}
              <div>
                <label className={labelClass}>Tanggal</label>
                <div className={inputContainerClass}>
                  <Calendar className={iconClass} size={18} />
                  <input
                    {...register('tanggal')}
                    type="date"
                    className={inputClass}
                  />
                </div>
                {errors.tanggal && <p className={errorClass}>{errors.tanggal.message}</p>}
              </div>
              
              {/* Kategori */}
              <div>
                <label className={labelClass}>Kategori</label>
                <div className={inputContainerClass}>
                  <Tag className={iconClass} size={18} />
                  <select {...register('kategori')} className={inputClass}>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Berita">Berita</option>
                    <option value="Pembangunan">Pembangunan</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>
                {errors.kategori && <p className={errorClass}>{errors.kategori.message}</p>}
              </div>
            </div>

            {/* Foto Upload */}
            <div>
              <label className={labelClass}>Foto Kegiatan</label>
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-600 font-medium">Klik untuk upload foto</p>
                  <p className="text-xs text-green-600 font-bold mt-1">Otomatis dikompres &lt; 500KB</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-48 w-full group bg-gray-50">
                  <Image 
                    src={previewUrl} 
                    alt="Preview" 
                    fill 
                    className="object-cover"
                    unoptimized // Penting agar blob preview tidak error
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="flex flex-col h-full">
            {/* Text Editor (Rich Text) */}
            <div className="flex-1 flex flex-col">
              <label className={labelClass}>Isi Artikel / Deskripsi Lengkap</label>
              <div className="flex-1 min-h-[300px]">
                <TextEditor
                  value={deskripsiValue || ''}
                  onChange={(val) => setValue("deskripsi", val, { shouldValidate: true })}
                />
              </div>
              {errors.deskripsi && <p className={errorClass}>{errors.deskripsi.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                disabled={isSubmitting}
                type="submit"
                className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition-transform active:scale-95 text-white ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-700 hover:bg-green-800'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? <Save size={20} /> : <Plus size={20} />)}
                {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Publikasikan Berita')}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* --- LIST DATA --- */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" size={32} /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 flex flex-col hover:shadow-md transition-shadow group">
              <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100 overflow-hidden">
                {item.foto_url ? (
                  <Image
                    src={item.foto_url}
                    alt={item.judul}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : <div className="h-full flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}

                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white shadow-sm">
                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-auto">
                  <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2 border border-green-100">
                    {item.kategori}
                  </span>
                  <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 leading-tight">{item.judul}</h3>

                  <p className="text-sm text-gray-500 line-clamp-2 whitespace-pre-line">
                    {stripHtml(item.deskripsi).substring(0, 100)}...
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 flex items-center justify-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 text-sm font-bold py-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(item.id, item.foto_url)}
                    className="flex items-center justify-center gap-1 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-20" />
              <p>Belum ada dokumentasi kegiatan.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL HAPUS */}
      <DeleteModal
        isOpen={deleteState.show}
        onClose={() => setDeleteState(prev => ({ ...prev, show: false }))}
        onConfirm={handleDelete}
        loading={deleteState.loading}
        title="Hapus Kegiatan?"
        message="Berita kegiatan ini akan dihapus permanen."
      />
    </div>
  )
}