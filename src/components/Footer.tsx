'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ProfilDesa } from '@/types'

interface FooterProps {
  profil: ProfilDesa | null;
}

export default function Footer({ profil }: FooterProps) {
  const pathname = usePathname()

  // Sembunyikan footer jika sedang di halaman admin
  if (pathname && pathname.startsWith('/admin')) {
    return null
  }

  // Fallback data jika profil belum diisi di DB
  const nama = profil?.nama_desa || "Desa Citamiang"
  const alamat = profil?.alamat_lengkap || "Kecamatan Maniis, Kabupaten Purwakarta"
  const email = profil?.email || "info@desacitamiang.id"
  const telp = profil?.telepon || "-"

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* Kolom 1: Info Desa Dinamis */}
          <div>
            <h3 className="text-xl font-bold mb-3">{nama}</h3>
            <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">
              {alamat}
            </p>
          </div>

          {/* Kolom 2: Quick Links / Menu */}
          <div>
            <h3 className="text-xl font-bold mb-3">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Beranda</Link></li>
              <li><Link href="/dokumentasi" className="text-gray-400 hover:text-white transition">Dokumentasi</Link></li>
              <li><Link href="/potensi" className="text-gray-400 hover:text-white transition">Potensi Desa</Link></li>
              <li><Link href="/umkm" className="text-gray-400 hover:text-white transition">UMKM</Link></li>
              <li><Link href="/perangkat" className="text-gray-400 hover:text-white transition">Perangkat Desa</Link></li>
            </ul>
          </div>

          {/* Kolom 3: Kontak Dinamis */}
          <div>
            <h3 className="text-xl font-bold mb-3">Kontak Kami</h3>
            <p className="text-gray-400 text-sm mb-3 leading-relaxed">
              <strong>Email:</strong> {email}<br />
              <strong>Telp/WA:</strong> {telp}<br />
              <strong>Pelayanan:</strong><br />Senin - Jumat (08.00 - 16.00)
            </p>
          </div>
        </div>

        {/* Bagian Bawah: Copyright & Link Admin */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Pemerintahan {nama}. All rights reserved.
          </p>
          
          {/* TOMBOL MENUJU ADMIN PANEL ADA DISINI */}
          <Link 
            href="/admin/login" 
            className="text-gray-600 hover:text-gray-300 text-xs transition font-medium px-3 py-1 rounded hover:bg-gray-700"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  )
}