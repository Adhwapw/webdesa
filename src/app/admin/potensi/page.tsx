'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, Save, Trash2, Edit2, MapPin, UploadCloud, X, Mountain, Tag } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

// --- PENTING: IMPORT LIBRARY KOMPRESI ---
import imageCompression from 'browser-image-compression'

// --- 1. SKEMA VALIDASI (ZOD) ---
// Perubahan: 'judul' diganti jadi 'nama' sesuai database
const potensiSchema = z.object({
    nama: z.string().min(3, "Nama potensi minimal 3 karakter"), 
    kategori: z.string().min(1, "Pilih kategori potensi"),
    deskripsi: z.string().min(20, "Deskripsi terlalu pendek (min 20 karakter)"),
    lokasi: z.string().optional(),
})

type PotensiFormValues = z.infer<typeof potensiSchema>

interface Potensi extends PotensiFormValues {
    id: number
    foto_url: string | null
    created_at?: string
}

export default function AdminPotensiPage() {
    const [data, setData] = useState<Potensi[]>([])
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [compressionProgress, setCompressionProgress] = useState(false)

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
        reset,
        setValue,
        formState: { errors }
    } = useForm<PotensiFormValues>({
        resolver: zodResolver(potensiSchema),
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase.from('potensi').select('*').order('id', { ascending: false })
            if (error) throw error
            setData(data as Potensi[])
        } catch (error) {
            toast.error('Gagal memuat data potensi')
        } finally {
            setLoading(false)
        }
    }

    // --- HANDLER FILE ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (selectedFile.size > 20 * 1024 * 1024) {
                toast.error('Ukuran file terlalu besar (Maks 20MB)')
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
    const handleEdit = (item: Potensi) => {
        setEditingId(item.id)
        // Perubahan: set nilai 'nama' bukan 'judul'
        setValue('nama', item.nama) 
        setValue('kategori', item.kategori)
        setValue('deskripsi', item.deskripsi)
        setValue('lokasi', item.lokasi || '')

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
    }

    // --- 4. SUBMIT HANDLER ---
    const onSubmit = async (values: PotensiFormValues) => {
        setIsSubmitting(true)

        try {
            let finalFotoUrl = previewUrl

            // Kompresi & Upload Foto
            if (file) {
                const options = {
                    maxSizeMB: 0.8,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                    initialQuality: 0.7
                }

                setCompressionProgress(true)
                const compressedFile = await imageCompression(file, options)
                setCompressionProgress(false)

                const fileExt = file.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const filePath = `${fileName}`

                // Upload ke bucket 'potensi'
                const { error: uploadError } = await supabase.storage.from('potensi').upload(filePath, compressedFile)
                
                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage.from('potensi').getPublicUrl(filePath)
                finalFotoUrl = publicUrl
            }

            // Simpan ke Database (Kolom 'nama' otomatis terisi dari values)
            if (editingId) {
                const { error } = await supabase
                    .from('potensi')
                    .update({ ...values, foto_url: finalFotoUrl })
                    .eq('id', editingId)

                if (error) throw error
                toast.success('Potensi berhasil diperbarui!')
            } else {
                const { error } = await supabase
                    .from('potensi')
                    .insert([{ ...values, foto_url: finalFotoUrl }])

                if (error) throw error
                toast.success('Potensi baru ditambahkan!')
            }

            handleCancel()
            fetchData()

        } catch (error: any) {
            console.error("FULL ERROR:", error)
            const message = error.message || error.error_description || "Terjadi kesalahan sistem"
            toast.error(`Gagal menyimpan: ${message}`)
        } finally {
            setIsSubmitting(false)
            setCompressionProgress(false)
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
                if (fileName) await supabase.storage.from('potensi').remove([fileName])
            }
            await supabase.from('potensi').delete().eq('id', deleteState.id)

            toast.success('Data dihapus')
            fetchData()
            setDeleteState({ show: false, id: null, foto_url: null, loading: false })
        } catch (error) {
            toast.error('Gagal menghapus')
            setDeleteState(prev => ({ ...prev, loading: false }))
        }
    }

    // Styles
    const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
    const errorClass = "text-red-500 text-xs mt-1 font-medium"

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Potensi Desa</h1>

            {/* --- FORM CARD --- */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border mb-8 transition-all ${editingId ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-200'}`}>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    {editingId ? <Edit2 size={20} className="text-orange-600" /> : <Plus size={20} className="text-green-600" />}
                    {editingId ? 'Edit Potensi' : 'Tambah Potensi Baru'}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {/* INPUT NAMA (Dulunya Judul) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Potensi</label>
                            <input {...register('nama')} className={inputClass} placeholder="Contoh: Air Terjun..." />
                            {errors.nama && <p className={errorClass}>{errors.nama.message}</p>}
                        </div>

                        {/* Kategori */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <select {...register('kategori')} className={`${inputClass} pl-10 appearance-none`}>
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="Wisata Alam">Wisata Alam</option>
                                    <option value="Wisata Buatan">Wisata Buatan</option>
                                    <option value="Budaya & Sejarah">Budaya & Sejarah</option>
                                    <option value="Kuliner">Kuliner</option>
                                    <option value="Pertanian">Pertanian & Perkebunan</option>
                                </select>
                            </div>
                            {errors.kategori && <p className={errorClass}>{errors.kategori.message}</p>}
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi / Dusun</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input {...register('lokasi')} className={`${inputClass} pl-10`} placeholder="Dusun 1..." />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Lengkap</label>
                            <textarea 
                                {...register('deskripsi')} 
                                className={inputClass} 
                                rows={4} 
                                placeholder="Jelaskan keunggulan potensi ini secara rinci..." 
                            />
                            {errors.deskripsi && <p className={errorClass}>{errors.deskripsi.message}</p>}
                        </div>

                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Foto Utama</label>
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
                                    <Image src={previewUrl} alt="Preview Foto" fill className="object-cover" />
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

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`flex-1 py-2.5 rounded-lg font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>{compressionProgress ? 'Mengompres...' : 'Menyimpan...'}</span>
                                    </div>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
                                    </>
                                )}
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
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                {item.foto_url ? (
                                    <Image 
                                        src={item.foto_url} 
                                        // Gunakan 'item.nama' untuk alt text
                                        alt={item.nama || 'Foto Potensi Desa'} 
                                        fill 
                                        className="object-cover transition-transform duration-500 group-hover:scale-110" 
                                        sizes="(max-width: 768px) 100vw, 33vw" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Mountain size={48} opacity={0.3} />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                        {item.kategori}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                {/* Tampilkan Nama (bukan Judul) */}
                                <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">{item.nama}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-xs mb-3">
                                    <MapPin size={12} />
                                    <span>{item.lokasi || 'Lokasi belum diset'}</span>
                                </div>
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
                            <Mountain size={48} className="mx-auto mb-2 opacity-20" />
                            <p>Belum ada data potensi desa.</p>
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