'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, MapPin, Store, Users, Loader2 } from 'lucide-react'

interface DashboardStats {
  dokumentasi: number;
  potensi: number;
  umkm: number;
  perangkat: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    dokumentasi: 0,
    potensi: 0,
    umkm: 0,
    perangkat: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [doc, pot, umkm, per] = await Promise.all([
          supabase.from('dokumentasi').select('id', { count: 'exact', head: true }),
          supabase.from('potensi').select('id', { count: 'exact', head: true }),
          supabase.from('umkm').select('id', { count: 'exact', head: true }),
          supabase.from('perangkat_desa').select('id', { count: 'exact', head: true })
        ])

        setStats({
          dokumentasi: doc.count || 0,
          potensi: pot.count || 0,
          umkm: umkm.count || 0,
          perangkat: per.count || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { title: 'Dokumentasi', count: stats.dokumentasi, icon: Camera, color: 'bg-blue-500' },
    { title: 'Potensi Desa', count: stats.potensi, icon: MapPin, color: 'bg-purple-500' },
    { title: 'UMKM', count: stats.umkm, icon: Store, color: 'bg-orange-500' },
    { title: 'Perangkat Desa', count: stats.perangkat, icon: Users, color: 'bg-green-500' },
  ]

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={40} />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Ringkasan data website Desa Sukamaju.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
            <div className={`${stat.color} p-4 rounded-lg text-white mr-4 shadow-sm`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}