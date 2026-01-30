'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2, Plus, Save, Trash2, Users, Edit2, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DeleteModal from '@/components/DeleteModal'

interface Statistik {
  id: number
  label: string
  jumlah: number
  satuan: string
}

export default function AdminKependudukanPage() {
  const [data, setData] = useState<Statistik[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Edit/Tambah
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState({ label: '', jumlah: '', satuan: 'Jiwa' })
  const [isSaving, setIsSaving] = useState(false)

  // State untuk Modal Hapus
  const [deleteState, setDeleteState] = useState<{
    show: boolean;
    id: number | null;
    loading: boolean;
  }>({
    show: false,
    id: null,
    loading: false
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('statistik')
        .select('*')
        .order('id', { ascending: true })
      
      if (error) throw error
      if (data) setData(data as Statistik[])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Gagal memuat data statistik')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Statistik) => {
    setEditingId(item.id)
    setForm({ label: item.label, jumlah: item.jumlah.toString(), satuan: item.satuan })
    // Scroll ke atas agar form terlihat
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setForm({ label: '', jumlah: '', satuan: 'Jiwa' })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingId) {
        // Update Data
        const { error } = await supabase.from('statistik').update({
          label: form.label,
          jumlah: parseInt(form.jumlah),
          satuan: form.satuan
        }).eq('id', editingId)

        if (error) throw error
        toast.success('Data berhasil diperbarui!')
      } else {
        // Insert Data Baru
        const { error } = await supabase.from('statistik').insert([{
          label: form.label,
          jumlah: parseInt(form.jumlah),
          satuan: form.satuan
        }])

        if (error) throw error
        toast.success('Data baru berhasil ditambahkan!')
      }
      
      handleCancel()
      fetchData()
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan data')
    } finally {
      setIsSaving(false)
    }
  }

  // 1. Trigger Modal (Hanya membuka modal)
  const confirmDelete = (id: number) => {
    setDeleteState({ show: true, id, loading: false })
  }

  // 2. Eksekusi Hapus (Dipanggil oleh Modal)
  const handleDelete = async () => {
    if (!deleteState.id) return

    setDeleteState(prev => ({ ...prev, loading: true }))

    try {
      const { error } = await supabase
        .from('statistik')
        .delete()
        .eq('id', deleteState.id)
      
      if (error) throw error
      
      toast.success('Data berhasil dihapus!')
      fetchData()
      // Tutup modal setelah sukses
      setDeleteState({ show: false, id: null, loading: false })
    } catch (error) {
      console.error(error)
      toast.error('Gagal menghapus data')
      setDeleteState(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Data Kependudukan</h1>

      {/* Form Input / Edit */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 transition-all hover:shadow-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            {editingId ? <Edit2 size={20} className="text-orange-600" /> : <Plus size={20} className="text-blue-600" />}
            {editingId ? 'Edit Data' : 'Tambah Kategori Baru'}
        </h2>
        
        <form onSubmit={handleSave} className="grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Label Kategori</label>
                <input 
                    type="text" 
                    value={form.label}
                    onChange={e => setForm({...form, label: e.target.value})}
                    placeholder="Contoh: Total Pemuda"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Jumlah</label>
                <input 
                    type="number" 
                    value={form.jumlah}
                    onChange={e => setForm({...form, jumlah: e.target.value})}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    required
                />
            </div>
            <div className="flex gap-2">
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-white transition-all shadow-sm active:scale-95 ${editingId ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editingId ? 'Update' : 'Simpan'}
                </button>
                {editingId && (
                    <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition-colors active:scale-95">
                        <X size={20} />
                    </button>
                )}
            </div>
        </form>
      </div>

      {/* List Statistik */}
      {loading ? (
        <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between group hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Users size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">{item.satuan}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{item.jumlah.toLocaleString('id-ID')}</h3>
                        <p className="text-gray-600 font-medium">{item.label}</p>
                    </div>
                    
                    {/* FIX: Menghapus class 'opacity-0' dan 'group-hover:opacity-100'
                       Agar tombol selalu muncul tanpa perlu di-hover
                    */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Data">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Data">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {data.length === 0 && (
                 <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-gray-300 rounded-xl">
                    <Users size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Belum ada data kependudukan.</p>
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
      />
    </div>
  )
}