'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Loader2, Building, BookOpen, History, Phone, Mail, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import SecuritySettings from '@/components/SecuritySettings'

// --- 1. SKEMA VALIDASI (ZOD) ---
const profilSchema = z.object({
  nama_desa: z.string().min(3, "Nama desa minimal 3 karakter"),
  email: z.string().email("Format email tidak valid").optional().or(z.literal('')), // Boleh kosong, tapi kalau isi harus email valid
  telepon: z.string().regex(/^[0-9]*$/, "Hanya boleh angka").min(10, "Nomor telepon minimal 10 digit").optional().or(z.literal('')),
  alamat_lengkap: z.string().min(10, "Alamat terlalu pendek"),
  sejarah: z.string().optional(),
  visi: z.string().optional(),
  misi: z.string().optional(),
})

type ProfilFormValues = z.infer<typeof profilSchema>

export default function AdminPengaturanPage() {
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- 2. SETUP REACT HOOK FORM ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProfilFormValues>({
    resolver: zodResolver(profilSchema),
  })

  useEffect(() => {
    fetchProfil()
  }, [])

  const fetchProfil = async () => {
    try {
      // Ambil data profil (asumsi ID=1 atau single row)
      const { data, error } = await supabase
        .from('profil_desa')
        .select('*')
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      
      if (data) {
        // Isi form dengan data dari database
        reset({
            nama_desa: data.nama_desa || '',
            email: data.email || '',
            telepon: data.telepon || '',
            alamat_lengkap: data.alamat_lengkap || '',
            sejarah: data.sejarah || '',
            visi: data.visi || '',
            misi: data.misi || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profil:', error)
      toast.error('Gagal memuat data profil')
    } finally {
      setLoading(false)
    }
  }

  // --- 3. SUBMIT HANDLER ---
  const onSubmit = async (values: ProfilFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Cek apakah data sudah ada (untuk menentukan insert/update)
      const { data: existingData } = await supabase.from('profil_desa').select('id').limit(1).maybeSingle()

      let error
      
      if (existingData) {
        // UPDATE
        const result = await supabase
          .from('profil_desa')
          .update({
            ...values,
          })
          .eq('id', existingData.id)
          error = result.error
      } else {
        // INSERT PERTAMA KALI
        const result = await supabase
          .from('profil_desa')
          .insert([values])
          error = result.error
      }

      if (error) throw error
      
      toast.success('Pengaturan profil berhasil disimpan!')
    } catch (error) {
      console.error('Error saving:', error)
      toast.error('Gagal menyimpan perubahan.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Styles
  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"
  const labelClass = "block text-sm font-bold text-gray-700 mb-1"
  const errorClass = "text-red-500 text-xs mt-1 font-medium"
  const iconClass = "absolute left-3 top-3 text-gray-400"
  const inputWithIconClass = "w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium transition-all"

  if (loading) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-green-600" size={32} />
          </div>
      )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Profil Desa</h1>
      
      {/* FORM UTAMA */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8 animate-fade-in-up">
        
        {/* BAGIAN 1: Identitas & Kontak */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                <Building size={20} className="text-green-700" /> Identitas & Kontak
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Nama Desa */}
                <div className="md:col-span-2">
                    <label className={labelClass}>Nama Desa / Instansi</label>
                    <input {...register('nama_desa')} className={inputClass} placeholder="Contoh: Pemerintah Desa Citamiang" />
                    {errors.nama_desa && <p className={errorClass}>{errors.nama_desa.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className={labelClass}>Email Resmi</label>
                    <div className="relative">
                        <Mail className={iconClass} size={18} />
                        <input {...register('email')} className={inputWithIconClass} placeholder="admin@desacitamiang.id" />
                    </div>
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                </div>

                {/* Telepon */}
                <div>
                    <label className={labelClass}>No. Telepon / WhatsApp</label>
                    <div className="relative">
                        <Phone className={iconClass} size={18} />
                        <input {...register('telepon')} className={inputWithIconClass} placeholder="081234567890" type="tel" />
                    </div>
                    {errors.telepon && <p className={errorClass}>{errors.telepon.message}</p>}
                </div>

                {/* Alamat */}
                <div className="md:col-span-2">
                    <label className={labelClass}>Alamat Lengkap</label>
                    <div className="relative">
                         <MapPin className={iconClass} size={18} />
                         <textarea {...register('alamat_lengkap')} className={`${inputWithIconClass} min-h-[80px] py-3`} placeholder="Jl. Raya Citamiang No..." />
                    </div>
                    {errors.alamat_lengkap && <p className={errorClass}>{errors.alamat_lengkap.message}</p>}
                </div>
            </div>
        </div>

        {/* BAGIAN 2: Sejarah */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                <History size={20} className="text-blue-700" /> Sejarah Desa
            </h3>
            <div>
                <label className={labelClass}>Cerita Sejarah Singkat</label>
                <textarea {...register('sejarah')} className={inputClass} rows={6} placeholder="Ceritakan sejarah berdirinya desa..." />
            </div>
        </div>

        {/* BAGIAN 3: Visi & Misi */}
        <div>
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2 border-b pb-2">
                <BookOpen size={20} className="text-purple-700" /> Visi & Misi
            </h3>
            <div className="space-y-6">
                <div>
                    <label className={labelClass}>Visi</label>
                    <textarea {...register('visi')} className={inputClass} rows={3} placeholder="Visi desa..." />
                </div>
                <div>
                    <label className={labelClass}>Misi</label>
                    <textarea {...register('misi')} className={inputClass} rows={6} placeholder="Tuliskan misi per baris..." />
                    <p className="text-xs text-gray-500 mt-2 font-medium bg-gray-50 p-2 rounded inline-block">💡 Tips: Gunakan tombol Enter untuk memisahkan setiap poin misi.</p>
                </div>
            </div>
        </div>

        {/* Tombol Simpan */}
        <div className="pt-4 border-t border-gray-100">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className={`bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2 shadow-md transition-all active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {isSubmitting ? 'Menyimpan Perubahan...' : 'Simpan Profil Desa'}
            </button>
        </div>

      </form>

      {/* Security Settings (Password) */}
      <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Keamanan Akun</h2>
          <SecuritySettings />
      </div>

    </div>
  )
}