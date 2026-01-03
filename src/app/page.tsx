import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, Store, Users, ArrowRight, Quote } from "lucide-react";
import { Dokumentasi, Potensi, UMKM, PerangkatDesa, Banner } from "@/types";

// Revalidate data setiap 60 detik agar data selalu update tanpa build ulang
export const revalidate = 60;

interface HomePageData {
  dokumentasi: Dokumentasi[];
  potensi: Potensi[];
  umkm: UMKM[];
  kepalaDesa: PerangkatDesa | null;
  banner: Banner | null;
}

async function getLatestData(): Promise<HomePageData> {
  try {
    // Ambil semua data secara paralel agar loading cepat
    const [dokumentasi, potensi, umkm, perangkat, bannerData] = await Promise.all([
      // 1. Dokumentasi: Ambil 3 terbaru
      supabase.from("dokumentasi").select("*").order("tanggal", { ascending: false }).limit(3),
      
      // 2. Potensi: Ambil 3 yang status aktif
      supabase.from("potensi").select("*").eq("status", "aktif").limit(3),
      
      // 3. UMKM: Ambil 3 yang status aktif
      supabase.from("umkm").select("*").eq("status", "aktif").limit(3),
      
      // 4. Kepala Desa: Ambil perangkat dengan urutan 1 (paling atas)
      supabase.from("perangkat_desa").select("*").eq("status", "aktif").order("urutan", { ascending: true }).limit(1),

      // 5. Banner: Ambil 1 yang aktif
      supabase.from("banners").select("*").eq("status", "aktif").limit(1).maybeSingle()
    ]);

    return {
      dokumentasi: (dokumentasi.data as Dokumentasi[]) || [],
      potensi: (potensi.data as Potensi[]) || [],
      umkm: (umkm.data as UMKM[]) || [],
      kepalaDesa: (perangkat.data?.[0] as PerangkatDesa) || null,
      banner: (bannerData.data as Banner) || null,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      dokumentasi: [],
      potensi: [],
      umkm: [],
      kepalaDesa: null,
      banner: null,
    };
  }
}

export default async function Home() {
  const { dokumentasi, potensi, umkm, kepalaDesa, banner } = await getLatestData();

  // Konfigurasi Banner Default
  const heroData = {
    judul: banner?.judul || "Selamat Datang di Desa Citamiang",
    deskripsi: banner?.deskripsi || "Membangun Desa di Ujung Selatan Purwakarta yang Asri dan Berdaya Saing.",
  };
  
  // JSON-LD untuk SEO Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Pemerintah Desa Citamiang',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Maniis',
      addressRegion: 'Purwakarta',
      addressCountry: 'ID'
    },
    url: 'https://desacitamiang.vercel.app'
  }

  return (
    <main className="bg-gray-50 overflow-x-hidden">
       {/* Inject JSON-LD Schema */}
       <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION (Banner) */}
      <section className="relative h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
        {banner?.foto_url ? (
             <div className="absolute inset-0">
                <Image 
                    src={banner.foto_url} 
                    alt="Banner Desa Citamiang" 
                    fill 
                    className="object-cover"
                    priority
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
             </div>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-green-900">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>
        )}

        <div className="relative h-full flex flex-col justify-end items-center text-white text-center px-4 z-10 pb-16 md:pb-32">
          <div className="max-w-4xl animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-green-500/20 border border-green-400/30 backdrop-blur-md text-green-300 text-xs md:text-sm font-medium mb-4">
              Website Resmi Pemerintah Desa
            </span>
            {/* Responsif Font Size */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 drop-shadow-lg leading-tight">
              {heroData.judul}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-gray-200 drop-shadow-md max-w-2xl mx-auto px-2">
              {heroData.deskripsi}
            </p>
            
            {/* Tombol Responsif (Stack di HP) */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full sm:w-auto px-6">
              <Link
                href="/tentang"
                className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 rounded-full font-bold transition shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Profil Desa <ArrowRight size={18} />
              </Link>
              <Link
                href="/dokumentasi"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 md:px-8 py-3 rounded-full font-bold transition flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Lihat Kegiatan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK SINGKAT */}
      <section className="relative z-20 -mt-10 md:-mt-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: 'Penduduk', val: '2,500+', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'UMKM Aktif', val: `${umkm.length}+`, icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Potensi', val: `${potensi.length}+`, icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Kegiatan', val: '50+', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3`}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">{stat.val}</h3>
              <p className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SAMBUTAN KEPALA DESA */}
      {kepalaDesa && (
        <section className="py-16 md:py-28">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-16">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>
              
              {/* Foto Kades */}
              <div className="relative shrink-0 mt-4 md:mt-0">
                <div className="w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative z-10 mx-auto">
                  {kepalaDesa.foto_url ? (
                    <Image
                      src={kepalaDesa.foto_url}
                      alt={kepalaDesa.nama_lengkap}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Users size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-green-700 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg whitespace-nowrap">
                  {kepalaDesa.jabatan}
                </div>
              </div>

              {/* Teks Sambutan */}
              <div className="relative z-10 text-center md:text-left w-full">
                <Quote className="text-green-200 mb-4 mx-auto md:mx-0 w-10 h-10 md:w-12 md:h-12" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Sambutan Kepala Desa</h2>
                <h3 className="text-lg md:text-xl text-green-700 font-bold mb-6">{kepalaDesa.nama_lengkap}</h3>
                
                {/* PERBAIKAN ESLINT DI SINI */}
                <div className="space-y-4 text-gray-600 leading-relaxed text-base md:text-lg">
                  <p>
                    &quot;Assalamu&apos;alaikum Warahmatullahi Wabarakatuh. Sampurasun!&quot;
                  </p>
                  <p>
                    Selamat datang di website resmi <strong>Desa Citamiang</strong>. Website ini kami hadirkan sebagai wujud transparansi dan upaya peningkatan pelayanan publik bagi masyarakat.
                  </p>
                  <p>
                    Melalui media ini, kami berharap dapat memberikan informasi seluas-luasnya mengenai potensi desa, pembangunan, serta kegiatan kemasyarakatan di Desa Citamiang. Mari bersama-sama kita bangun desa kita tercinta ini agar semakin maju, mandiri, dan sejahtera.
                  </p>
                </div>

                <div className="mt-8">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/2/29/Tanda_Tangan_Contoh.png" 
                        alt="Tanda Tangan" 
                        className="h-10 md:h-12 opacity-50 mx-auto md:mx-0" 
                    />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. DOKUMENTASI TERBARU */}
      <section className="py-16 md:py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4">
            <div className="text-center md:text-left w-full md:w-auto">
              <span className="text-green-600 font-bold tracking-wider text-xs md:text-sm uppercase">Kabar Desa</span>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">Kegiatan Terbaru</h2>
            </div>
            <Link href="/dokumentasi" className="hidden md:flex text-green-700 font-bold hover:text-green-800 items-center gap-2 group">
              Lihat Galeri <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Grid Responsif: 1 Kolom di HP, 2 di Tablet, 3 di Laptop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {dokumentasi.length > 0 ? (
              dokumentasi.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-56 md:h-60 overflow-hidden">
                    {item.foto_url ? (
                      <Image
                        src={item.foto_url}
                        alt={item.judul}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Calendar className="text-gray-400" /></div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <span className="text-green-600 text-xs font-bold uppercase tracking-wide">{item.kategori || 'Berita'}</span>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mt-2 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {item.judul}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>
              ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <p>Belum ada dokumentasi terbaru.</p>
                </div>
            )}
          </div>
          
          {/* Tombol Lihat Galeri (Muncul di HP di bawah list) */}
          <div className="mt-8 text-center md:hidden">
            <Link href="/dokumentasi" className="inline-flex bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold items-center gap-2">
               Lihat Semua Kegiatan <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. POTENSI & UMKM HIGHLIGHT */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
            <div className="bg-green-900 rounded-3xl p-8 md:p-16 text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Potensi & Ekonomi Desa</h2>
                    <p className="text-green-100 text-base md:text-lg mb-8 md:mb-10 leading-relaxed px-2">
                        Desa Citamiang memiliki kekayaan alam yang melimpah dan warga yang kreatif. 
                        Jelajahi potensi wisata alam dan dukung produk UMKM lokal kami.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-6">
                        <Link href="/potensi" className="bg-white text-green-900 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm md:text-base">
                            <MapPin size={20} /> Jelajahi Potensi
                        </Link>
                        <Link href="/umkm" className="bg-green-800 text-white border border-green-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm md:text-base">
                            <Store size={20} /> Lihat Produk UMKM
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>
    </main>
  );
}