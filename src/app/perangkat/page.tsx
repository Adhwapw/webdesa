import { supabase } from '@/lib/supabase'
import { PerangkatDesa } from '@/types'
import { User } from 'lucide-react'
import Image from 'next/image'

// Revalidate data setiap 60 detik
export const revalidate = 60;

async function getPerangkatDesa() {
  try {
    const { data, error } = await supabase
      .from('perangkat_desa')
      .select('*')
      .eq('status', 'aktif')
    
    if (error) throw error
    return (data as PerangkatDesa[]) || []
  } catch (error) {
    console.error('Error fetching perangkat:', error)
    return []
  }
}

// --- LOGIKA CERDAS: DETEKSI JABATAN ---
// Fungsi ini menentukan "Siapa bosnya" berdasarkan tulisan di jabatan
const assignLevelByJabatan = (data: PerangkatDesa[]) => {
  const kadesKeywords = ['kepala desa', 'kades', 'kuwu', 'lurah']
  const sekdesKeywords = ['sekretaris', 'sekdes', 'carik', 'juru tulis']
  // Jabatan pelaksana (Kaur, Kasi, Kadus)
  const staffKeywords = ['kaur', 'kasi', 'kepala seksi', 'kepala urusan', 'kadus', 'kepala dusun', 'staf']

  let topLevel: PerangkatDesa[] = []
  let midLevel: PerangkatDesa[] = []
  let btmLevel: PerangkatDesa[] = []
  let others: PerangkatDesa[] = []

  data.forEach((item) => {
    const jabatanLower = item.jabatan.toLowerCase()

    if (kadesKeywords.some(k => jabatanLower.includes(k))) {
      topLevel.push(item)
    } else if (sekdesKeywords.some(k => jabatanLower.includes(k))) {
      midLevel.push(item)
    } else if (staffKeywords.some(k => jabatanLower.includes(k))) {
      btmLevel.push(item)
    } else {
      // Jika jabatan tidak dikenali, masukkan ke level bawah (atau buat level baru jika perlu)
      others.push(item)
    }
  })

  // Gabungkan staff umum dengan 'others' di level bawah
  return { 
    topLevel, 
    midLevel, 
    btmLevel: [...btmLevel, ...others].sort((a, b) => a.jabatan.localeCompare(b.jabatan)) 
  }
}

// --- KOMPONEN KARTU ---
const OrgCard = ({ item }: { item: PerangkatDesa }) => (
  <div className="relative bg-white w-48 md:w-56 rounded-xl shadow-lg border border-gray-200 z-20 group transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col items-center">
      {/* Foto Bulat */}
      <div className="absolute -top-8 w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-300">
          {item.foto_url ? (
              <Image src={item.foto_url} alt={item.nama_lengkap} fill className="object-cover" />
          ) : <User className="w-full h-full p-3 text-gray-400" />}
      </div>

      <div className="pt-10 pb-4 px-3 text-center w-full">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 line-clamp-2">{item.nama_lengkap}</h3>
          <p className="text-green-700 font-bold text-xs uppercase tracking-wide line-clamp-1">{item.jabatan}</p>
      </div>
      
      {/* Garis Hiasan Bawah */}
      <div className="h-1 w-full bg-green-600 rounded-b-xl mt-auto"></div>
  </div>
)

// --- KOMPONEN ITEM BAWAHAN (POHON) ---
const TreeNode = ({ item, isFirst, isLast }: { item: PerangkatDesa, isFirst: boolean, isLast: boolean }) => {
  return (
    <div className="flex flex-col items-center relative px-3 md:px-6">
       {/* GARIS PENGHUBUNG HORIZONTAL & VERTIKAL */}
       {/* Container garis ini posisinya absolute di atas kartu */}
       <div className="absolute top-0 left-0 right-0 h-8 w-full pointer-events-none">
           {/* Garis Horizontal Kiri (Menyambung ke kiri) - Sembunyi jika anak pertama */}
           {!isFirst && <div className="absolute top-0 left-0 w-1/2 h-0.5 bg-gray-400" />}
           
           {/* Garis Horizontal Kanan (Menyambung ke kanan) - Sembunyi jika anak terakhir */}
           {!isLast && <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-gray-400" />}

           {/* Garis Vertikal Turun ke Kepala Kartu */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gray-400" />
       </div>

       {/* Wrapper Kartu dengan margin-top agar tidak menabrak garis */}
       <div className="mt-8">
          <OrgCard item={item} />
       </div>
    </div>
  )
}

export default async function PerangkatPage() {
  const data = await getPerangkatDesa()
  
  // GUNAKAN LOGIKA OTOMATIS DISINI
  const { topLevel, midLevel, btmLevel } = assignLevelByJabatan(data)

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <section className="bg-green-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Struktur Organisasi</h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">
          Pemerintahan Desa Citamiang
        </p>
      </section>

      {/* Container Pohon - Scrollable Horizontal */}
      <div className="w-full overflow-x-auto p-10 pt-16 scrollbar-hide flex justify-center">
        <div className="min-w-max flex flex-col items-center">
            
            {/* LEVEL 1: KEPALA DESA */}
            {topLevel.length > 0 ? (
                <div className="flex flex-col items-center relative z-30">
                    <div className="flex gap-8">
                        {topLevel.map(item => <OrgCard key={item.id} item={item} />)}
                    </div>
                    {/* Garis Turun dari Kades */}
                    <div className="w-0.5 h-8 bg-gray-400"></div>
                </div>
            ) : (
               /* Placeholder jika Kades belum diinput */
               <div className="mb-8 text-gray-400 italic text-sm">Belum ada data Kepala Desa</div>
            )}

            {/* LEVEL 2: SEKRETARIS DESA */}
            {midLevel.length > 0 && (
                <div className="flex flex-col items-center relative z-20">
                    {/* Garis Vertikal Masuk ke Sekdes */}
                    <div className="w-0.5 h-4 bg-gray-400 mb-0"></div>
                    
                    <div className="flex gap-8">
                        {midLevel.map(item => <OrgCard key={item.id} item={item} />)}
                    </div>

                    {/* Garis Turun dari Sekdes ke Bawahannya */}
                    {btmLevel.length > 0 && <div className="w-0.5 h-8 bg-gray-400"></div>}
                </div>
            )}

            {/* Jika TIDAK ADA Sekdes, tapi ADA bawahan, kita butuh garis sambung dari Kades langsung ke Bawah */}
            {midLevel.length === 0 && btmLevel.length > 0 && topLevel.length > 0 && (
                 <div className="w-0.5 h-8 bg-gray-400"></div>
            )}

            {/* LEVEL 3: KAUR, KASI, KADUS (Berjajar ke samping) */}
            {btmLevel.length > 0 && (
                 <div className="flex justify-center items-start pt-0">
                    {btmLevel.map((item, index) => (
                        <TreeNode 
                            key={item.id} 
                            item={item} 
                            isFirst={index === 0} 
                            isLast={index === btmLevel.length - 1}
                        />
                    ))}
                </div>
            )}

            {data.length === 0 && (
                <div className="text-center text-gray-500 py-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <User size={48} className="mx-auto text-gray-300 mb-2" />
                    <p>Struktur organisasi belum tersedia.</p>
                </div>
            )}
        </div>
      </div>
    </main>
  )
}