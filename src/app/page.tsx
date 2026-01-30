import Image from "next/image";
import { stripHtml } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, Store, Users, ArrowRight, Quote, BarChart3, FileText, LandPlot, Mars } from "lucide-react";
import { Dokumentasi, Potensi, UMKM, PerangkatDesa, Banner } from "@/types";

// Revalidate data setiap 60 detik agar data selalu update tanpa build ulang
export const revalidate = 60;

// Definisi Tipe Data Statistik
interface Statistik {
  id?: number; // Optional karena data otomatis tidak punya ID database
  label: string;
  jumlah: number;
  satuan: string;
}

interface HomePageData {
  dokumentasi: Dokumentasi[];
  potensi: Potensi[];
  umkm: UMKM[];
  kepalaDesa: PerangkatDesa | null;
  banner: Banner | null;
  statistik: Statistik[];
  totalUmkm: number;
  totalPotensi: number;
}

async function getLatestData(): Promise<HomePageData> {
  try {
    const [
      dokumentasi,
      potensi,
      umkm,
      perangkat,
      bannerData,
      statistikData,
      countUmkm,
      countPotensi
    ] = await Promise.all([
      // 1. List Data (Limit 3 untuk highlight)
      supabase.from("dokumentasi").select("*").order("tanggal", { ascending: false }).limit(3),
      supabase.from("potensi").select("*").eq("status", "aktif").limit(3),
      supabase.from("umkm").select("*").eq("status", "aktif").limit(3),

      // 2. Perangkat & Banner
      supabase.from("perangkat_desa").select("*").eq("status", "aktif").order("urutan", { ascending: true }).limit(1),
      supabase.from("banners").select("*").eq("status", "aktif").limit(1).maybeSingle(),

      // 3. Data Statistik Manual (Misal: Penduduk)
      supabase.from("statistik").select("*").order("id", { ascending: true }),

      // 4. HITUNG TOTAL DATA (Count Only)
      supabase.from("umkm").select("*", { count: 'exact', head: true }).eq("status", "aktif"),
      supabase.from("potensi").select("*", { count: 'exact', head: true }).eq("status", "aktif")
    ]);

    return {
      dokumentasi: (dokumentasi.data as Dokumentasi[]) || [],
      potensi: (potensi.data as Potensi[]) || [],
      umkm: (umkm.data as UMKM[]) || [],
      kepalaDesa: (perangkat.data?.[0] as PerangkatDesa) || null,
      banner: (bannerData.data as Banner) || null,
      statistik: (statistikData.data as Statistik[]) || [],
      totalUmkm: countUmkm.count || 0,
      totalPotensi: countPotensi.count || 0,
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      dokumentasi: [], potensi: [], umkm: [], kepalaDesa: null, banner: null, statistik: [],
      totalUmkm: 0, totalPotensi: 0
    };
  }
}

// FUNGSI CERDAS: Memilih Ikon & Warna Berdasarkan Label
const getStatTheme = (label: string) => {
  const lowerLabel = label.toLowerCase();

  // 1. Kependudukan (Users)
  if (lowerLabel.includes('penduduk') || lowerLabel.includes('jiwa') || lowerLabel.includes('warga') || lowerLabel.includes('orang') || lowerLabel.includes('kk')) {
    return { icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' };
  }

  // 2. Ekonomi / UMKM (Store)
  if (lowerLabel.includes('umkm') || lowerLabel.includes('usaha') || lowerLabel.includes('dagang') || lowerLabel.includes('toko') || lowerLabel.includes('produk')) {
    return { icon: Store, color: 'text-orange-600', bg: 'bg-orange-50' };
  }

  // 3. Wilayah / Potensi (Map/Land)
  if (lowerLabel.includes('potensi') || lowerLabel.includes('wisata') || lowerLabel.includes('alam') || lowerLabel.includes('wilayah') || lowerLabel.includes('luas')) {
    return { icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' };
  }

  // 4. Kegiatan / Agenda (Calendar)
  if (lowerLabel.includes('kegiatan') || lowerLabel.includes('agenda') || lowerLabel.includes('acara')) {
    return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' };
  }

  if (lowerLabel.includes('Laki-laki')) {
    return { icon:Mars , color: 'text-purple-600', bg: 'bg-purple-50' };
  }

  // Default (Chart)
  return { icon: BarChart3, color: 'text-gray-600', bg: 'bg-gray-50' };
}

export default async function Home() {
  const { dokumentasi, potensi, umkm, kepalaDesa, banner, statistik, totalUmkm, totalPotensi } = await getLatestData();

  // Konfigurasi Banner
  const heroData = {
    judul: banner?.judul || "Selamat Datang di Desa Citamiang",
    deskripsi: banner?.deskripsi || "Membangun Desa di Ujung Selatan Purwakarta yang Asri dan Berdaya Saing.",
  };

  // GABUNGKAN DATA: Statistik Manual (DB) + Statistik Otomatis (Count Live)
  // Kita filter dulu agar tidak ada duplikasi jika admin sudah input manual "UMKM" di DB
  const manualStats = statistik.filter(s =>
    !s.label.toLowerCase().includes('umkm') &&
    !s.label.toLowerCase().includes('potensi')
  );

  const finalStats = [
    ...manualStats, // Penduduk, KK, dll dari DB
    { label: 'UMKM Terdaftar', jumlah: totalUmkm, satuan: 'Unit' },
    { label: 'Potensi Desa', jumlah: totalPotensi, satuan: 'Lokasi' }
  ];

  // JSON-LD SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Pemerintah Desa Citamiang',
    url: 'https://desacitamiang.vercel.app'
  }

  return (
    <main className="bg-gray-50 overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1. HERO SECTION */}
      <section className="relative h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
        {banner?.foto_url ? (
          <div className="absolute inset-0">
            <Image src={banner.foto_url} alt="Banner" fill className="object-cover" priority />
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
              Website Resmi Desa Citamiang
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 md:mb-6 drop-shadow-lg leading-tight">
              {heroData.judul}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-gray-200 drop-shadow-md max-w-2xl mx-auto px-2">
              {heroData.deskripsi}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center w-full sm:w-auto px-6">
              <Link href="/tentang" className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-3 rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2 text-sm md:text-base">
                Profil Desa <ArrowRight size={18} />
              </Link>
              <Link href="/dokumentasi" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 md:px-8 py-3 rounded-full font-bold transition flex items-center justify-center gap-2 text-sm md:text-base">
                Lihat Kegiatan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATISTIK SINGKAT (DINAMIS & SESUAI IKON) */}
      <section className="relative z-20 -mt-10 md:-mt-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {finalStats.map((stat, idx) => {
            const theme = getStatTheme(stat.label);
            return (
              <div key={idx} className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
                <div className={`${theme.bg} ${theme.color} w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 md:mb-3`}>
                  <theme.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  {stat.jumlah.toLocaleString('id-ID')}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  {stat.label} <span className="text-[10px] opacity-70">({stat.satuan})</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SAMBUTAN KEPALA DESA */}
      {kepalaDesa && (
        <section className="py-16 md:py-28">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-16">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>

              <div className="relative shrink-0 mt-4 md:mt-0">
                <div className="w-40 h-40 md:w-64 md:h-64 rounded-full overflow-hidden border-[6px] border-white shadow-2xl relative z-10 mx-auto">
                  {kepalaDesa.foto_url ? (
                    <Image src={kepalaDesa.foto_url} alt={kepalaDesa.nama_lengkap} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Users size={64} className="text-gray-400" /></div>
                  )}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-green-700 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg whitespace-nowrap">
                  {kepalaDesa.jabatan}
                </div>
              </div>

              <div className="relative z-10 text-center md:text-left w-full">
                <Quote className="text-green-200 mb-4 mx-auto md:mx-0 w-10 h-10 md:w-12 md:h-12" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Sambutan Kepala Desa</h2>
                <h3 className="text-lg md:text-xl text-green-700 font-bold mb-6">{kepalaDesa.nama_lengkap}</h3>
                <div className="space-y-4 text-gray-600 leading-relaxed text-base md:text-lg">
                  <p>&quot;Assalamu&apos;alaikum Warahmatullahi Wabarakatuh. Sampurasun!&quot;</p>
                  <p>Selamat datang di website resmi <strong>Desa Citamiang</strong>. Melalui media ini, kami berharap dapat memberikan informasi seluas-luasnya mengenai potensi desa, pembangunan, serta kegiatan kemasyarakatan.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. DOKUMENTASI & KABAR DESA */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {dokumentasi.length > 0 ? (
              dokumentasi.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-56 md:h-60 overflow-hidden">
                    {item.foto_url ? (
                      <Image src={item.foto_url} alt={item.judul} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Calendar className="text-gray-400" /></div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="p-5 md:p-6">
                    <span className="text-green-600 text-xs font-bold uppercase tracking-wide">{item.kategori || 'Berita'}</span>
                    <h3 className="font-bold text-lg md:text-xl text-gray-800 mt-2 mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">{item.judul}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{stripHtml(item.deskripsi, 8)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <p>Belum ada kegiatan terbaru.</p>
              </div>
            )}
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
                Jelajahi potensi wisata alam dan dukung {totalUmkm} produk UMKM lokal kami.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto px-6">
                <Link href="/potensi" className="bg-white text-green-900 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-green-50 transition flex items-center justify-center gap-2">
                  <MapPin size={20} /> Jelajahi Potensi
                </Link>
                <Link href="/umkm" className="bg-green-800 text-white border border-green-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2">
                  <Store size={20} /> Lihat {totalUmkm} Produk UMKM
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}