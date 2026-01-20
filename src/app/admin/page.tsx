'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Camera, MapPin, Store, Users, Loader2, 
  Image as ImageIcon, Building, Calendar, ArrowRight, PlusCircle 
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  dokumentasi: number;
  potensi: number;
  umkm: number;
  perangkat: number;
  banner_aktif: number;
}

interface RecentActivity {
  id: number;
  judul: string;
  tanggal: string;
  kategori: string;
}

interface VillageProfile {
  nama_desa: string;
  alamat_lengkap: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dokumentasi: 0, potensi: 0, umkm: 0, perangkat: 0, banner_aktif: 0
  })
  const [recentDocs, setRecentDocs] = useState<RecentActivity[]>([])
  const [profile, setProfile] = useState<VillageProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Format Tanggal Hari Ini
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1. Ambil Statistik Angka
        const [doc, pot, umkm, per, ban] = await Promise.all([
          supabase.from('dokumentasi').select('id', { count: 'exact', head: true }),
          supabase.from('potensi').select('id', { count: 'exact', head: true }),
          supabase.from('umkm').select('id', { count: 'exact', head: true }),
          supabase.from('perangkat_desa').select('id', { count: 'exact', head: true }),
          supabase.from('banners').select('id', { count: 'exact', head: true }).eq('status', 'aktif')
        ])

        // 2. Ambil 5 Kegiatan Terbaru
        const { data: recentData } = await supabase
          .from('dokumentasi')
          .select('id, judul, tanggal, kategori')
          .order('tanggal', { ascending: false })
          .limit(5)

        // 3. Ambil Profil Desa Ringkas
        const { data: profilData } = await supabase
          .from('profil_desa')
          .select('nama_desa, alamat_lengkap')
          .single()

        setStats({
          dokumentasi: doc.count || 0,
          potensi: pot.count || 0,
          umkm: umkm.count || 0,
          perangkat: per.count || 0,
          banner_aktif: ban.count || 0
        })

        if (recentData) setRecentDocs(recentData)
        if (profilData) setProfile(profilData)

      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    { title: 'Berita & Kegiatan', count: stats.dokumentasi, icon: Camera, color: 'bg-blue-600', link: '/admin/dokumentasi' },
    { title: 'Potensi Desa', count: stats.potensi, icon: MapPin, color: 'bg-purple-600', link: '/admin/potensi' },
    { title: 'UMKM Terdaftar', count: stats.umkm, icon: Store, color: 'bg-orange-600', link: '/admin/umkm' },
    { title: 'Perangkat Desa', count: stats.perangkat, icon: Users, color: 'bg-green-600', link: '/admin/perangkat' },
  ]

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-green-700" size={48} />
        <p className="text-gray-500 font-medium">Memuat Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, Admin! 👋</h1>
          <p className="text-gray-500 mt-1">{today}</p>
        </div>
        
        {/* Kartu Profil Desa Kecil */}
        {profile && (
          <div className="flex items-center gap-4 bg-green-50 px-5 py-3 rounded-lg border border-green-100">
            <div className="bg-green-200 p-2 rounded-full text-green-700">
              <Building size={24} />
            </div>
            <div>
              <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Sedang Mengelola</p>
              <h3 className="text-green-900 font-bold text-lg">{profile.nama_desa}</h3>
              <p className="text-green-700 text-xs truncate max-w-[200px]">{profile.alamat_lengkap}</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link key={index} href={stat.link} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center hover:shadow-md hover:border-green-200 transition-all cursor-pointer h-full">
              <div className={`${stat.color} p-4 rounded-xl text-white mr-4 shadow-md group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.count}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Aktivitas Terbaru (Lebar 2 kolom) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" /> 
              Publikasi Terbaru
            </h2>
            <Link href="/admin/dokumentasi" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua <ArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentDocs.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Belum ada kegiatan yang diupload.</p>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
                  <div className="bg-blue-100 text-blue-600 font-bold text-xs px-3 py-1 rounded-full mt-1 shrink-0">
                    {doc.kategori}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-bold line-clamp-1">{doc.judul}</h4>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(doc.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Status Lain & Quick Actions (Lebar 1 kolom) */}
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl shadow-md p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-green-200 text-sm font-medium mb-1">Banner Halaman Depan</p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-bold">{stats.banner_aktif}</h3>
                <span className="text-green-200 text-sm mb-1.5">Sedang Aktif</span>
              </div>
              <Link href="/admin/banner" className="inline-block mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition-colors backdrop-blur-sm">
                Kelola Banner &rarr;
              </Link>
            </div>
            <ImageIcon className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-gray-800 font-bold mb-4">Pintasan Cepat</h3>
            <div className="space-y-3">
              <Link href="/admin/dokumentasi" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-700 transition-all group">
                <PlusCircle size={20} className="text-gray-400 group-hover:text-green-600" />
                <span className="font-medium text-sm">Tambah Berita Baru</span>
              </Link>
              <Link href="/admin/umkm" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-600 hover:text-orange-700 transition-all group">
                <PlusCircle size={20} className="text-gray-400 group-hover:text-orange-600" />
                <span className="font-medium text-sm">Tambah Data UMKM</span>
              </Link>
              <Link href="/admin/pengaturan" className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-700 transition-all group">
                <Building size={20} className="text-gray-400 group-hover:text-blue-600" />
                <span className="font-medium text-sm">Update Profil Desa</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}