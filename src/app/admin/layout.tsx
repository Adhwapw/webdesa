'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Camera,
  MapPin,
  Store,
  Users,
  LogOut,
  Menu,
  X,
  LucideIcon,
  Image as ImageIcon
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
    const timer = setTimeout(() => {
      const data = localStorage.getItem('admin')
      if (data) {
        setAdmin(JSON.parse(data) as AdminUser)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])


  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-100">{children}</div>
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin/login'
  }

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Banner Depan', href: '/admin/banner', icon: ImageIcon },
    { name: 'Dokumentasi', href: '/admin/dokumentasi', icon: Camera },
    { name: 'Potensi Desa', href: '/admin/potensi', icon: MapPin },
    { name: 'UMKM', href: '/admin/umkm', icon: Store },
    { name: 'Perangkat Desa', href: '/admin/perangkat', icon: Users },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 bg-green-900 text-white`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-green-800">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-green-300 text-sm mt-1">Desa Citamiang</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-green-700 text-white shadow-md'
                        : 'text-green-100 hover:bg-green-800 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-green-800 bg-green-950/30">
              <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Login sebagai</p>
              <p className="font-semibold truncate">
                {admin ? admin.nama_lengkap : 'Memuat...'}
              </p>

              <button
                onClick={handleLogout}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut size={16} />
                Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay Mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="md:ml-64 min-h-screen flex flex-col">
          <header className="bg-white shadow-sm sticky top-0 z-20 md:hidden">
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-800">
                {menuItems.find(i => i.href === pathname)?.name || 'Admin Panel'}
              </span>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}