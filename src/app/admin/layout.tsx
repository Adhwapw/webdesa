'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Image as ImageIcon,
  Camera,     // Ikon Dokumentasi (sesuai request awal)
  MapPin,     // Ikon Potensi Desa (sesuai request awal)
  Store,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Briefcase,
  LucideIcon
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AdminUser } from '@/types'

interface MenuItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)

  useEffect(() => {
    // FIX: Menggunakan setTimeout untuk menghindari error "setState during render"
    // Ini memastikan data diambil setelah komponen selesai dirender
    const timer = setTimeout(() => {
      const data = localStorage.getItem('admin')
      if (data) {
        try {
          setAdmin(JSON.parse(data) as AdminUser)
        } catch (e) {
          console.error("Gagal memparsing data admin", e)
        }
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // Jika halaman login, render tanpa layout admin
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-100">{children}</div>
  }

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('admin')
      window.location.href = '/admin/login'
    }
  }

  // Definisi Menu Admin
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Banner Depan', href: '/admin/banner', icon: ImageIcon },
    { name: 'Kependudukan', href: '/admin/kependudukan', icon: Users },
    { name: 'Dokumentasi', href: '/admin/dokumentasi', icon: Camera },
    { name: 'Potensi Desa', href: '/admin/potensi', icon: MapPin },
    { name: 'UMKM', href: '/admin/umkm', icon: Store },
    { name: 'Perangkat Desa', href: '/admin/perangkat', icon: Briefcase },
    { name: 'Pengaturan', href: '/admin/pengaturan', icon: Settings },
  ]

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
        
        {/* === MOBILE OVERLAY === */}
        {/* Background gelap saat sidebar terbuka di HP */}
        <div 
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
              sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}
            onClick={() => setSidebarOpen(false)}
        />

        {/* === SIDEBAR === */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:static'}
        `}>
          {/* Header Sidebar */}
          <div className="p-6 border-b border-green-800 flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-green-300 text-sm mt-1">Desa Citamiang</p>
            </div>
            {/* Tombol Close hanya di HP */}
            <button 
                onClick={() => setSidebarOpen(false)} 
                className="md:hidden text-green-300 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items (Scrollable) */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon // Pastikan ini diawali huruf Kapital
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-green-700 text-white shadow-md translate-x-1'
                      : 'text-green-100 hover:bg-green-800 hover:text-white hover:translate-x-1'
                  }`}
                >
                  {/* Render Icon */}
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer Sidebar (User Info) */}
          <div className="p-4 border-t border-green-800 bg-green-950/30 shrink-0">
            <div className="mb-4">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Login sebagai</p>
                <p className="font-semibold truncate text-white">
                    {admin ? admin.nama_lengkap : 'Memuat...'}
                </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </div>
        </aside>

        {/* === MAIN CONTENT === */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Mobile Header (Hamburger Menu) */}
          <header className="bg-white shadow-sm p-4 md:hidden flex items-center justify-between shrink-0 z-30">
            <span className="font-bold text-gray-800 text-lg">
                {menuItems.find(i => i.href === pathname)?.name || 'Admin Panel'}
            </span>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 scroll-smooth">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
          </main>
        </div>

      </div>
    </ProtectedRoute>
  )
}