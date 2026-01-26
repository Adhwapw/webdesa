'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Save, Trash2, Edit2, Store, UploadCloud, X, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

// --- 1. SKEMA VALIDASI (ZOD) ---
// Ini menentukan aturan main data kita. Jika melanggar, form tidak akan submit.
const umkmSchema = z.object({
  nama_umkm: z.string().min(3, "Nama UMKM minimal 3 karakter"),
  pemilik: z.string().min(3, "Nama pemilik minimal 3 karakter"),
  deskripsi: z.string().min(10, "Deskripsi terlalu pendek (min 10 karakter)"),
  kontak: z.string().min(10, "Nomor HP tidak valid (min 10 angka)").regex(/^[0-9]+$/, "Hanya boleh angka"),
  alamat: z.string().optional(),
})

// Tipe data diturunkan langsung dari Zod (Otomatis)
type UmkmFormValues = z.infer<typeof umkmSchema>

// Tipe data dari Database
interface UMKM extends UmkmFormValues {
  id: number
  foto_url: string | null
  created_at?: string
}

export default function AdminUmkmPage() {
  const [data, setData] = useState<UMKM[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State untuk Edit & Upload
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
    reset,
    setValue,
    formState: { errors }
  } = useForm<UmkmFormValues>({
    resolver: zodResolver(umkmSchema), // Sambungkan Zod ke Form
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase.from('umkm').select('*').order('id', { ascending: false })
      if (error) throw error
      setData(data as UMKM[])
    } catch (error) {
      toast.error('Gagal memuat data UMKM')
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER FILE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 2MB')
        return
      }
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile)) // Preview lokal
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- 3. FITUR EDIT (POPULATE FORM) ---
  const handleEdit = (item: UMKM) => {
    setEditingId(item.id)
    // Isi form otomatis menggunakan setValue dari React Hook Form
    setValue('nama_umkm', item.nama_umkm)
    setValue('pemilik', item.pemilik)
    setValue('deskripsi', item.deskripsi)
    setValue('kontak', item.kontak)
    setValue('alamat', item.alamat || '')

    // Set preview foto lama jika ada
    if (item.foto_url) {
      setPreviewUrl(item.foto_url)
    } else {
      setPreviewUrl(null)
    }

    // Scroll ke form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    reset() // Kosongkan form otomatis
    clearFile()
  }

  // --- 4. SUBMIT HANDLER (CREATE & UPDATE) ---
  const onSubmit = async (values: UmkmFormValues) => {
    setIsSubmitting(true)

    try {
      let finalFotoUrl = previewUrl

      // 1. Jika ada file baru diupload
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('umkm').upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('umkm').getPublicUrl(filePath)
        finalFotoUrl = publicUrl
      }

      // 2. Logika Simpan ke DB
      if (editingId) {
        // --- MODE UPDATE ---
        const { error } = await supabase
          .from('umkm')
          .update({
            ...values, // Spread semua data form
            foto_url: finalFotoUrl
          })
          .eq('id', editingId)

        if (error) throw error
        toast.success('UMKM berhasil diperbarui!')

      } else {
        // --- MODE INSERT ---
        const { error } = await supabase
          .from('umkm')
          .insert([{
            ...values,
            foto_url: finalFotoUrl
          }])

        if (error) throw error
        toast.success('UMKM baru ditambahkan!')
      }

      handleCancel()
      fetchData()

    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan data')
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
        if (fileName) await supabase.storage.from('umkm').remove([fileName])
      }
      await supabase.from('umkm').delete().eq('id', deleteState.id)

      toast.success('Data dihapus')
      fetchData()
      setDeleteState({ show: false, id: null, foto_url: null, loading: false })
    } catch (error) {
      toast.error('Gagal menghapus')
      setDeleteState(prev => ({ ...prev, loading: false }))
    }
  }

  // Class styles
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
  const errorClass = "text-red-500 text-xs mt-1 font-medium"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Data UMKM</h1>

      {/* --- FORM CARD --- */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border mb-8 transition-all ${editingId ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200'}`}>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
          {editingId ? <Edit2 size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
          {editingId ? 'Edit UMKM' : 'Tambah UMKM Baru'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Input dengan Register Zod */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama UMKM</label>
              <input {...register('nama_umkm')} className={inputClass} placeholder="Contoh: Keripik Pisang Mak Ijah" />
              {errors.nama_umkm && <p className={errorClass}>{errors.nama_umkm.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pemilik</label>
              <input {...register('pemilik')} className={inputClass} placeholder="Nama lengkap pemilik" />
              {errors.pemilik && <p className={errorClass}>{errors.pemilik.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">No. WhatsApp</label>
              <input {...register('kontak')} className={inputClass} placeholder="0812..." type="tel" />
              {errors.kontak && <p className={errorClass}>{errors.kontak.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Alamat (Opsional)</label>
              <textarea {...register('alamat')} className={inputClass} rows={2} placeholder="Alamat produksi..." />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Produk</label>
              <textarea {...register('deskripsi')} className={inputClass} rows={4} placeholder="Jelaskan produk unggulan..." />
              {errors.deskripsi && <p className={errorClass}>{errors.deskripsi.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Foto Produk</label>
              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <UploadCloud className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Klik untuk upload foto</p>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 h-40 w-full group">
                  {/* Tampilkan Preview (bisa dari URL lama atau Blob baru) */}
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
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

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
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
            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-100 relative">
                {item.foto_url ? (
                  <Image src={item.foto_url} alt={item.nama_umkm} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Store size={48} opacity={0.3} />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{item.nama_umkm}</h3>
                <p className="text-sm text-blue-600 font-medium mb-2">{item.pemilik}</p>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.deskripsi}</p>

                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(item.id, item.foto_url)}
                    className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
              <Store size={48} className="mx-auto mb-2 opacity-20" />
              <p>Belum ada data UMKM.</p>
            </div>
          )}
        </div>
      )}

      <DeleteModal
        isOpen={deleteState.show}
        onClose={() => setDeleteState(prev => ({ ...prev, show: false }))}
        onConfirm={handleDelete}
        loading={deleteState.loading}
      />
    </div>
  )
}