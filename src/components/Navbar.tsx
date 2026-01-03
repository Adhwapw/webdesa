'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

// 1. Interface sudah benar
interface NavbarProps {
  namaDesa?: string;
}

// 2. PERBAIKAN DISINI: Tambahkan destructuring props
export default function Navbar({ namaDesa = "Desa Citamiang" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  if (pathname && pathname.startsWith('/admin')) return null

  const menuItems = [
    { name: 'Beranda', href: '/' },
    { name: 'Dokumentasi', href: '/dokumentasi' },
    { name: 'Potensi', href: '/potensi' },
    { name: 'UMKM', href: '/umkm' },
    { name: 'Perangkat', href: '/perangkat' },
    { name: 'Tentang', href: '/tentang' },
  ]

  return (
    <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <Link href="/" className="text-xl md:text-2xl font-bold truncate pr-4">
            {namaDesa} {/* Sekarang error ini akan hilang */}
          </Link>

          {/* Desktop Menu (Hidden di HP) */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 text-sm lg:text-base font-medium">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`hover:text-green-200 transition ${pathname === item.href ? 'text-green-200 border-b-2 border-green-200' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile Button (Hidden di Desktop) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-green-600 focus:outline-none transition"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-2 pt-2 pb-4 space-y-1 bg-green-800 rounded-b-lg shadow-inner">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-3 rounded-md text-base font-medium hover:bg-green-600 transition ${pathname === item.href ? 'bg-green-900 text-white' : 'text-green-100'}`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}