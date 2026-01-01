'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import {
  LayoutDashboard,
  Camera,
  MapPin,
  Store,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('admin')
    window.location.href = '/admin/login'
  }

  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Dokumentasi', href: '/admin/dokumentasi', icon: Camera },
    { name: 'Potensi Desa', href: '/admin/potensi', icon: MapPin },
    { name: 'UMKM', href: '/admin/umkm', icon: Store },
    { name: 'Perangkat Desa', href: '/admin/perangkat', icon: Users },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 bg-green-800 text-white`}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-green-700">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className="text-green-200 text-sm mt-1">Desa Sukamaju</p>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-green-700'
                        : 'hover:bg-green-700/50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-green-700">
              <p className="text-sm text-green-200">Login sebagai:</p>
              <p className="font-semibold">
                {typeof window !== 'undefined' &&
                localStorage.getItem('admin')
                  ? JSON.parse(localStorage.getItem('admin')).nama_lengkap
                  : 'Admin'}
              </p>

              <button
                onClick={handleLogout}
                className="mt-3 w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="md:ml-64">
          <header className="bg-white shadow-sm sticky top-0 z-20">
            <div className="px-4 py-4 flex justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                {sidebarOpen ? <X /> : <Menu />}
              </button>
              <h2 className="text-xl font-semibold">
                {menuItems.find(i => i.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
