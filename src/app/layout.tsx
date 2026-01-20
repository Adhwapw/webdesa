import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { supabase } from '@/lib/supabase'
import { ProfilDesa } from '@/types'
import { Toaster } from 'react-hot-toast' // 1. Import Toaster

const inter = Inter({ subsets: ['latin'] })

// Fungsi ambil data profil
async function getProfilDesa() {
  const { data } = await supabase.from('profil_desa').select('*').single()
  return data as ProfilDesa | null
}

export const metadata: Metadata = {
  metadataBase: new URL('https://desacitamiang.vercel.app'),
  title: {
    default: 'Desa Citamiang | Kecamatan Maniis Kabupaten Purwakarta',
    template: '%s | Desa Citamiang Purwakarta'
  },
  description: 'Website Resmi Desa Citamiang, Kecamatan Maniis, Kabupaten Purwakarta. Informasi potensi desa, layanan publik, UMKM, dan wisata Taman Desa Citamiang.',
  keywords: ['Desa Citamiang', 'Maniis', 'Purwakarta', 'Website Desa', 'Wisata Purwakarta', 'Taman Desa Citamiang'],
  authors: [{ name: 'Pemerintah Desa Citamiang' }],
  icons: {
    icon: '/favicon.ico',
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
        {/* 2. Pasang Toaster di sini (di paling atas body) */}
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#ECFDF5', // Hijau muda
                color: '#065F46',      // Hijau tua
                border: '1px solid #34D399'
              },
            },
            error: {
              style: {
                background: '#FEF2F2', // Merah muda
                color: '#991B1B',      // Merah tua
                border: '1px solid #F87171'
              },
            },
          }}
        />

        {/* Lempar data ke Navbar */}
        <Navbar namaDesa={profil?.nama_desa} />
        
        {children}
        
        {/* Lempar data ke Footer */}
        <Footer profil={profil} />
      </body>
    </html>
  )
}