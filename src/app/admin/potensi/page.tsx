'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { stripHtml } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { Potensi } from '@/types'
import { Loader2, Plus, Trash2, MapPin, Image as ImageIcon, Type, UploadCloud, X, Tag } from 'lucide-react'
import Image from 'next/image'
import TextEditor from '@/components/TextEditor'
import toast from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

export default function AdminPotensiPage() {
    const [data, setData] = useState<Potensi[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // State Modal Delete
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const [nama, setNama] = useState('')
    const [deskripsi, setDeskripsi] = useState('')
    const [lokasi, setLokasi] = useState('')
    const [kategori, setKategori] = useState('Wisata')
    const [file, setFile] = useState<File | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data, error } = await supabase
                .from('potensi')
                .select('*')
                .order('id', { ascending: false })

            if (data) setData(data as Potensi[])
        } catch (error) {
            toast.error('Gagal memuat data potensi')
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

        if (!file) return toast.error('Pilih foto terlebih dahulu')

        // Validasi 5MB
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File terlalu besar (Max 5MB).')
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Hanya boleh mengupload file gambar.')
            return
        }

        setUploading(true)
        const toastId = toast.loading('Menyimpan potensi...')

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('potensi')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('potensi')
                .getPublicUrl(filePath)

            const { error: dbError } = await supabase
                .from('potensi')
                .insert([{
                    nama,
                    deskripsi,
                    lokasi,
                    kategori,
                    foto_url: publicUrl,
                    status: 'aktif'
                }])

            if (dbError) throw dbError

            setNama(''); setDeskripsi(''); setLokasi('');
            removeFile();
            fetchData();

            toast.dismiss(toastId)
            toast.success('Potensi berhasil ditambahkan!')

        } catch (error) {
            console.error('Error:', error)
            toast.dismiss(toastId)
            toast.error('Gagal menyimpan data.')
        } finally {
            setUploading(false)
        }
    }

    // Modal Logic
    const openDeleteModal = (id: number) => {
        setDeleteId(id)
        setIsDeleteOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        setDeleteLoading(true)
        try {
            await supabase.from('potensi').delete().eq('id', deleteId)
            fetchData()
            toast.success('Data dihapus')
            setIsDeleteOpen(false)
        } catch (error) {
            toast.error('Gagal menghapus data')
        } finally {
            setDeleteLoading(false)
        }
    }

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'aktif' ? 'non-aktif' : 'aktif'
        try {
            await supabase.from('potensi').update({ status: newStatus }).eq('id', id)
            fetchData()
            toast.success('Status berhasil diubah')
        } catch (error) {
            toast.error('Error updating status')
        }
    }

    // Styles
    const labelClass = "block text-sm font-bold text-black mb-2"
    const inputContainerClass = "relative"
    const iconClass = "absolute left-3 top-3 text-gray-600"
    const inputClass = "w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-lg bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"

    return (
        <div>
            <DeleteModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
            />

            <h1 className="text-2xl font-bold text-blue-600 mb-6">Kelola Potensi Desa</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-green-600 border-b pb-2">
                    <Plus size={20} /> Tambah Potensi Baru
                </h2>

                {/* --- PERUBAHAN LAYOUT DI SINI --- */}
                <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-8">

                    {/* KOLOM KIRI: Inputs & Foto */}
                    <div className="space-y-5">
                        <div>
                            <label className={labelClass}>Nama Potensi</label>
                            <div className={inputContainerClass}>
                                <Type className={iconClass} size={18} />
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={e => setNama(e.target.value)}
                                    className={inputClass}
                                    placeholder="Contoh: Air Terjun Curug Indah"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Lokasi</label>
                            <div className={inputContainerClass}>
                                <MapPin className={iconClass} size={18} />
                                <input
                                    type="text"
                                    value={lokasi}
                                    onChange={e => setLokasi(e.target.value)}
                                    className={inputClass}
                                    placeholder="Contoh: Dusun 02, RT 05"
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
                                    <option value="Wisata">Wisata</option>
                                    <option value="Pertanian">Pertanian</option>
                                    <option value="Peternakan">Peternakan</option>
                                    <option value="Budaya">Seni & Budaya</option>
                                    <option value="Produk">Produk Lokal</option>
                                </select>
                            </div>
                        </div>

                        {/* DRAG & DROP DIPINDAH KE SINI (KIRI) */}
                        <div>
                            <label className={labelClass}>Foto Potensi</label>
                            {!file ? (
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-400 hover:bg-gray-50'
                                        }`}
                                >
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
                                    <UploadCloud className="mx-auto text-gray-500 mb-2" size={32} />
                                    <p className="text-sm text-gray-700 font-medium">Klik atau Drag foto kesini</p>
                                    <p className="text-xs text-red-500 mt-1 font-bold">*Maksimal 5MB</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                                    <ImageIcon className="text-blue-600" />
                                    <span className="text-sm font-medium text-black truncate flex-1">{file.name}</span>
                                    <button type="button" onClick={removeFile}><X size={18} className="text-red-600 hover:scale-110 transition-transform" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KOLOM KANAN: Deskripsi & Tombol */}
                    <div className="flex flex-col h-full">
                        <label className={labelClass}>Deskripsi Lengkap Potensi</label>
                        <div className="flex-1">
                            <TextEditor
                                value={deskripsi}
                                onChange={setDeskripsi}
                            />
                        </div>

                        <button
                            disabled={uploading}
                            type="submit"
                            className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium mt-4 shadow-md transition-transform active:scale-95 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                            {uploading ? 'Menyimpan...' : 'Simpan Potensi'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => (
                    <div key={item.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${item.status === 'aktif' ? 'border-transparent' : 'border-gray-200 opacity-75'}`}>
                        <div className="relative h-48 bg-gray-100">
                            {item.foto_url ? (
                                <Image src={item.foto_url} alt={item.nama} fill className="object-cover" />
                            ) : <div className="h-full flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>}

                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${item.status === 'aktif' ? 'bg-green-500' : 'bg-gray-500'}`}>
                                    {item.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800 line-clamp-1">{item.nama}</h3>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{item.kategori}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                                <MapPin size={12} className="mr-1" /> {item.lokasi}
                            </div>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10 whitespace-pre-line">{stripHtml(item.deskripsi,8)}</p>

                            <div className="pt-3 border-t flex justify-between items-center">
                                <button
                                    onClick={() => toggleStatus(item.id, item.status)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${item.status === 'aktif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                >
                                    {item.status === 'aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                                </button>
                                <button
                                    onClick={() => openDeleteModal(item.id)}
                                    className="text-gray-400 hover:text-red-500 p-1 transition-colors"
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