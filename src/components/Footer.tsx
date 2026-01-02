'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  if (pathname && pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* Kolom 1: Info Desa - UPDATE ALAMAT */}
          <div>
            <h3 className="text-xl font-bold mb-3">Desa Citamiang</h3>
            <p className="text-gray-400 text-sm">
              Jl. Raya Palumbon<br />
              Kecamatan Maniis<br />
              Kabupaten Purwakarta, Jawa Barat<br />
              Kode Pos: 41162
            </p>
          </div>

          {/* Kolom 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-3">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white">Beranda</Link></li>
              <li><Link href="/dokumentasi" className="text-gray-400 hover:text-white">Dokumentasi</Link></li>
              <li><Link href="/potensi" className="text-gray-400 hover:text-white">Potensi Desa</Link></li>
              <li><Link href="/umkm" className="text-gray-400 hover:text-white">UMKM</Link></li>
              <li><Link href="/perangkat" className="text-gray-400 hover:text-white">Perangkat Desa</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak */}
          <div>
            <h3 className="text-xl font-bold mb-3">Kontak Kami</h3>
            <p className="text-gray-400 text-sm mb-3">
              Email: info@desacitamiang.id<br />
              Pelayanan: Senin - Jumat (08.00 - 16.00)
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; 2025 Pemerintahan Desa Citamiang. All rights reserved.
          </p>
          
          <Link 
            href="/admin" 
            className="text-gray-600 hover:text-gray-400 text-xs mt-2 md:mt-0 transition"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  )
}