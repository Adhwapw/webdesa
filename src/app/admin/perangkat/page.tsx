'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Save, Trash2, User, Briefcase, ListOrdered, UploadCloud, Edit2, CheckCircle, XCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

// --- 1. SKEMA VALIDASI (ZOD) ---
const perangkatSchema = z.object({
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
  jabatan: z.string().min(2, "Jabatan wajib diisi"),
  urutan: z.coerce.number().min(1, "Nomor urut minimal 1"),
  status: z.enum(['aktif', 'non-aktif']).default('aktif'),
})

// Tipe data untuk Database
interface PerangkatDesa {
  id: number
  nama_lengkap: string
  jabatan: string
  urutan: number
  status: 'aktif' | 'non-aktif'
  foto_url: string | null
  created_at?: string
}

export default function AdminPerangkatPage() {
  const [data, setData] = useState<PerangkatDesa[]>([])
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
  // Hapus generic <PerangkatFormValues> agar tidak error TS dengan Zod Coerce
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(perangkatSchema),
    defaultValues: {
      status: 'aktif',
      urutan: 1
    }
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('perangkat_desa')
        .select('*')
        .order('urutan', { ascending: true })

      if (error) throw error
      setData(data as PerangkatDesa[])
    } catch (error) {
      toast.error('Gagal memuat data perangkat')
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
        setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const clearFile = () => {
    setFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- 3. FITUR EDIT ---
  const handleEdit = (item: PerangkatDesa) => {
    setEditingId(item.id)
    setValue('nama_lengkap', item.nama_lengkap)
    setValue('jabatan', item.jabatan)
    setValue('urutan', item.urutan)
    setValue('status', item.status) // Status harus sesuai 'aktif' | 'non-aktif'

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
    // Auto set nomor urut berikutnya
    const maxUrutan = data.length > 0 ? Math.max(...data.map(d => d.urutan)) : 0
    setValue('urutan', maxUrutan + 1)
  }

  // --- 4. SUBMIT HANDLER ---
  // Gunakan 'any' untuk values karena kita menghapus generic useForm tadi (aman karena dijaga Zod)
  const onSubmit = async (values: any) => {
    setIsSubmitting(true)

    try {
      let finalFotoUrl = previewUrl

      // Upload Foto Baru
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from('perangkat_desa').upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('perangkat_desa').getPublicUrl(filePath)
        finalFotoUrl = publicUrl
      }

      if (editingId) {
        // UPDATE
        const { error } = await supabase
            .from('perangkat_desa')
            .update({ ...values, foto_url: finalFotoUrl })
            .eq('id', editingId)
        
        if (error) throw error
        toast.success('Data perangkat diperbarui!')
      } else {
        // INSERT
        const { error } = await supabase
            .from('perangkat_desa')
            .insert([{ ...values, foto_url: finalFotoUrl }])
        
        if (error) throw error
        toast.success('Perangkat baru ditambahkan!')
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
            if (fileName) await supabase.storage.from('perangkat_desa').remove([fileName])
        }
        await supabase.from('perangkat_desa').delete().eq('id', deleteState.id)
        
        toast.success('Data dihapus')
        fetchData()
        setDeleteState({ show: false, id: null, foto_url: null, loading: false })
    } catch (error) {
        toast.error('Gagal menghapus')
        setDeleteState(prev => ({ ...prev, loading: false }))
    }
  }

  // --- TOGGLE STATUS ---
  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
        const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
        await supabase.from('perangkat_desa').update({ status: newStatus }).eq('id', id)
        fetchData()
        toast.success(`Status diubah: ${newStatus}`)
    } catch (error) {
        toast.error('Gagal update status')
    }
  }

  // Styles
  const labelClass = "block text-sm font-bold text-gray-700 mb-2"
  const inputContainerClass = "relative"
  const iconClass = "absolute left-3 top-3 text-gray-500"
  const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
  const errorClass = "text-red-500 text-xs mt-1 font-medium"

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Perangkat Desa</h1>

      {/* --- FORM CARD --- */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border mb-8 transition-all ${editingId ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200'}`}>
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
            {editingId ? <Edit2 size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
            {editingId ? 'Edit Perangkat' : 'Tambah Perangkat Baru'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
                {/* Nama Lengkap */}
                <div>
                    <label className={labelClass}>Nama Lengkap & Gelar</label>
                    <div className={inputContainerClass}>
                        <User className={iconClass} size={18} />
                        <input {...register('nama_lengkap')} className={inputClass} placeholder="Contoh: H. Ahmad Zaki, S.Kom" />
                    </div>
                    {errors.nama_lengkap && <p className={errorClass}>{errors.nama_lengkap.message?.toString()}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Jabatan */}
                    <div>
                        <label className={labelClass}>Jabatan</label>
                        <div className={inputContainerClass}>
                            <Briefcase className={iconClass} size={18} />
                            <input 
                                {...register('jabatan')} 
                                className={inputClass} 
                                placeholder="Kaur..." 
                                list="jabatan-list"
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
                        {errors.jabatan && <p className={errorClass}>{errors.jabatan.message?.toString()}</p>}
                    </div>
                    {/* Urutan */}
                    <div>
                        <label className={labelClass}>No. Urut</label>
                        <div className={inputContainerClass}>
                            <ListOrdered className={iconClass} size={18} />
                            <input 
                                {...register('urutan')} 
                                type="number" 
                                className={inputClass} 
                            />
                        </div>
                        {errors.urutan && <p className={errorClass}>{errors.urutan.message?.toString()}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                {/* Upload Foto */}
                <div>
                    <label className={labelClass}>Foto Profil</label>
                    {!previewUrl ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-600 font-medium">Klik untuk upload foto</p>
                            <p className="text-xs text-gray-400 mt-1">*Maksimal 2MB</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            {/* FIX: Ganti img dengan Next Image dan unoptimized karena ini blob preview */}
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border">
                                <Image 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    fill 
                                    className="object-cover" 
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 truncate">{file?.name || 'Foto Lama'}</p>
                                <button type="button" onClick={clearFile} className="text-xs text-red-600 hover:underline">Hapus / Ganti</button>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                     <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`flex-1 py-3 rounded-lg font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                     >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? <Save size={20} /> : <Plus size={20} />)}
                        {isSubmitting ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Simpan Data')}
                     </button>
                     {editingId && (
                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200"
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
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={32} /></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((item) => (
                <div key={item.id} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center transition-all hover:shadow-lg ${item.status === 'aktif' ? 'border-gray-200' : 'border-red-200 bg-red-50/50'}`}>
                    
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mb-4 border-2 border-white shadow-md group cursor-pointer" onClick={() => handleEdit(item)}>
                        {item.foto_url ? (
                            <Image src={item.foto_url} alt={item.nama_lengkap} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="100px" />
                        ) : <User className="w-full h-full p-6 text-gray-300" />}
                        
                        {/* Overlay Edit saat hover foto */}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 className="text-white" size={20} />
                        </div>
                    </div>
                    
                    <div className="text-center w-full mb-4">
                        <div className="flex justify-center items-center gap-2 mb-2">
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                                Urut: {item.urutan}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 line-clamp-1 text-lg">{item.nama_lengkap}</h3>
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
                            onClick={() => confirmDelete(item.id, item.foto_url)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Permanen"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
            
            {data.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
                    <User size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Belum ada data perangkat desa.</p>
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
        title="Hapus Perangkat?"
        message="Data ini akan dihapus permanen."
      />
    </div>
  )
}