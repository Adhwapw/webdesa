import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase' // Import supabase
import { ProfilDesa } from '@/types'

const inter = Inter({ subsets: ['latin'] })

// Fungsi ambil data profil
async function getProfilDesa() {
  const { data } = await supabase.from('profil_desa').select('*').single()
  return data as ProfilDesa | null
}
export const metadata: Metadata = {
  metadataBase: new URL('https://desacitamiang.vercel.app'), // Ganti dengan domain aslimu nanti
  title: {
    default: 'Desa Citamiang | Kecamatan Maniis Kabupaten Purwakarta',
    template: '%s | Desa Citamiang Purwakarta'
  },
  description: 'Website Resmi Desa Citamiang, Kecamatan Maniis, Kabupaten Purwakarta. Informasi potensi desa, layanan publik, UMKM, dan wisata Taman Desa Citamiang.',
  keywords: ['Desa Citamiang', 'Maniis', 'Purwakarta', 'Website Desa', 'Wisata Purwakarta', 'Taman Desa Citamiang'],
  authors: [{ name: 'Pemerintah Desa Citamiang' }],
  icons: {
    icon: '/favicon.ico', // Pastikan punya favicon
  },
  openGraph: {
    title: 'Desa Citamiang | Purwakarta',
    description: 'Menuju Desa Citamiang yang Maju, Mandiri, dan Sejahtera.',
    url: 'https://desacitamiang.vercel.app',
    siteName: 'Website Desa Citamiang',
    locale: 'id_ID',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profil = await getProfilDesa() // Fetch di Server Component

  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Lempar data ke Navbar */}
        <Navbar namaDesa={profil?.nama_desa} />
        
        {children}
        
        {/* Lempar data ke Footer */}
        <Footer profil={profil} />
      </body>
    </html>
  )
}