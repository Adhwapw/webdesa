import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, Store, Users } from "lucide-react";
import { Dokumentasi, Potensi, UMKM, PerangkatDesa, Banner } from "@/types"; // Import Banner

export const revalidate = 60; 

interface HomePageData {
  dokumentasi: Dokumentasi[];
  potensi: Potensi[];
  umkm: UMKM[];
  kepalaDesa: PerangkatDesa | null;
  banner: Banner | null; // Tambahkan tipe Banner
}

async function getLatestData(): Promise<HomePageData> {
  try {
    const [dokumentasi, potensi, umkm, perangkat, bannerData] = await Promise.all([
      supabase.from("dokumentasi").select("*").order("tanggal", { ascending: false }).limit(3),
      supabase.from("potensi").select("*").eq("status", "aktif").limit(3),
      supabase.from("umkm").select("*").eq("status", "aktif").limit(3),
      supabase.from("perangkat_desa").select("*").eq("status", "aktif").order("urutan").limit(1),
      // Fetch Banner yang aktif
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

  const heroData = {
    judul: banner?.judul || "Selamat Datang di Desa Citamiang",
    deskripsi: banner?.deskripsi || "Kecamatan Maniis, Kabupaten Purwakarta - Bersama Membangun Desa yang Maju dan Sejahtera",
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: 'Pemerintah Desa Citamiang',
    url: 'https://desacitamiang.vercel.app',
    logo: 'https://desacitamiang.vercel.app/logo-purwakarta.png', // Ganti URL logo
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Jl. Raya Palumbon',
      addressLocality: 'Maniis',
      addressRegion: 'Purwakarta',
      postalCode: '41162',
      addressCountry: 'ID'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+62-812-XXXX-XXXX',
      contactType: 'customer service'
    }
  }

  return (
    <main>
        {/* Script ini tidak akan tampil di layar, tapi dibaca Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gray-900 overflow-hidden">
        {/* Background Image Logic */}
        {banner?.foto_url ? (
             <div className="absolute inset-0">
                <Image 
                    src={banner.foto_url} 
                    alt="Banner Desa" 
                    fill 
                    className="object-cover"
                    priority
                />
                 {/* Gradient Overlay: Hitam di bawah, transparan di atas */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
             </div>
        ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
                <div className="absolute inset-0 bg-black/20"></div>
            </div>
        )}

        {/* PERUBAHAN POSISI DISINI:
            1. 'items-center' tetap (tengah horizontal)
            2. 'justify-center' diganti 'justify-end' (supaya turun ke bawah)
            3. Ditambah 'pb-20' (jarak dari bawah)
        */}
        <div className="relative h-full flex flex-col justify-end items-center text-white text-center px-4 z-10 pb-24">
          <div className="max-w-4xl animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
              {heroData.judul}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-green-50 drop-shadow-md">
              {heroData.deskripsi}
            </p>
            
            {/* Tombol */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/dokumentasi"
                className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition shadow-lg text-sm md:text-base"
              >
                Lihat Dokumentasi
              </Link>
              <Link
                href="/tentang"
                className="bg-green-700/80 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition shadow-lg border border-white/30 text-sm md:text-base"
              >
                Tentang Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <Users className="mx-auto mb-3 text-green-600" size={40} />
              <h3 className="text-3xl font-bold text-gray-800">2,500+</h3>
              <p className="text-gray-600">Penduduk</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <Store className="mx-auto mb-3 text-blue-600" size={40} />
              <h3 className="text-3xl font-bold text-gray-800">
                {umkm.length}+
              </h3>
              <p className="text-gray-600">UMKM Aktif</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <MapPin className="mx-auto mb-3 text-purple-600" size={40} />
              <h3 className="text-3xl font-bold text-gray-800">
                {potensi.length}+
              </h3>
              <p className="text-gray-600">Potensi Desa</p>
            </div>
            <div className="text-center p-6 bg-orange-50 rounded-xl">
              <Calendar className="mx-auto mb-3 text-orange-600" size={40} />
              <h3 className="text-3xl font-bold text-gray-800">50+</h3>
              <p className="text-gray-600">Kegiatan/Tahun</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sambutan Kepala Desa */}
      {kepalaDesa && (
        <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-green-600 to-green-700 p-8 flex items-center justify-center">
                  {kepalaDesa.foto_url ? (
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image
                        src={kepalaDesa.foto_url}
                        alt={kepalaDesa.nama_lengkap}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                      <span className="text-7xl text-white font-bold">
                        {kepalaDesa.nama_lengkap.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 p-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Sambutan Kepala Desa
                  </h2>
                  <h3 className="text-xl text-green-600 font-semibold mb-4">
                    {kepalaDesa.nama_lengkap}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {`Assalamu'alaikum Warahmatullahi Wabarakatuh. Selamat datang di website resmi Desa Sukamaju. 
  Kami berkomitmen untuk terus meningkatkan pelayanan kepada masyarakat dan membangun desa 
  yang lebih maju, sejahtera, dan mandiri. Website ini dibuat untuk memberikan informasi 
  terkini tentang kegiatan, potensi, dan UMKM yang ada di desa kita.`}
                  </p>
                  <Link
                    href="/perangkat"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    Lihat Struktur Organisasi
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dokumentasi Terbaru */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Dokumentasi Kegiatan
              </h2>
              <p className="text-gray-600 mt-2">
                Kegiatan terbaru di desa kami
              </p>
            </div>
            <Link
              href="/dokumentasi"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
            >
              Lihat Semua →
            </Link>
          </div>

          {dokumentasi.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {dokumentasi.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {item.foto_url ? (
                    <div className="relative h-56 bg-gray-200">
                      <Image
                        src={item.foto_url}
                        alt={item.judul}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <Calendar size={64} className="text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar size={16} className="mr-2" />
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    {item.kategori && (
                      <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full mb-3">
                        {item.kategori}
                      </span>
                    )}
                    <h3 className="font-bold text-xl mb-3 text-gray-800 line-clamp-2">
                      {item.judul}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={64} className="mx-auto mb-4 text-gray-300" />
              <p>Belum ada dokumentasi kegiatan</p>
            </div>
          )}
        </div>
      </section>

      {/* Potensi Desa */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Potensi Desa
              </h2>
              <p className="text-gray-600 mt-2">
                Kekayaan dan potensi unggulan desa
              </p>
            </div>
            <Link
              href="/potensi"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
            >
              Lihat Semua →
            </Link>
          </div>

          {potensi.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {potensi.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {item.foto_url ? (
                    <div className="relative h-56 bg-gray-200">
                      <Image
                        src={item.foto_url}
                        alt={item.nama}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <MapPin size={64} className="text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    {item.kategori && (
                      <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-3">
                        {item.kategori}
                      </span>
                    )}
                    <h3 className="font-bold text-xl mb-3 text-gray-800">
                      {item.nama}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {item.deskripsi}
                    </p>
                    {item.lokasi && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin size={16} className="mr-2" />
                        {item.lokasi}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
              <p>Belum ada data potensi desa</p>
            </div>
          )}
        </div>
      </section>

      {/* UMKM */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                UMKM Desa
              </h2>
              <p className="text-gray-600 mt-2">
                Produk lokal unggulan dari masyarakat
              </p>
            </div>
            <Link
              href="/umkm"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center gap-2"
            >
              Lihat Semua →
            </Link>
          </div>

          {umkm.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {umkm.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {item.foto_url ? (
                    <div className="relative h-56 bg-gray-200">
                      <Image
                        src={item.foto_url}
                        alt={item.nama_umkm}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-56 bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                      <Store size={64} className="text-white/50" />
                    </div>
                  )}
                  <div className="p-6">
                    {item.kategori && (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full mb-3">
                        {item.kategori}
                      </span>
                    )}
                    <h3 className="font-bold text-xl mb-2 text-gray-800">
                      {item.nama_umkm}
                    </h3>
                    {item.pemilik && (
                      <p className="text-sm text-gray-500 mb-3">
                        Pemilik: {item.pemilik}
                      </p>
                    )}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {item.deskripsi}
                    </p>
                    {item.kontak && (
                      <a
                        href={`tel:${item.kontak}`}
                        className="text-green-600 hover:text-green-700 text-sm font-semibold"
                      >
                        Hubungi →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Store size={64} className="mx-auto mb-4 text-gray-300" />
              <p>Belum ada data UMKM</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ingin Tahu Lebih Banyak?
          </h2>
          <p className="text-xl mb-8 text-green-50">
            Jelajahi lebih dalam tentang desa kami, program-program, dan cara
            berkontribusi
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/tentang"
              className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Tentang Desa
            </Link>
            <Link
              href="/perangkat"
              className="bg-green-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-800 transition shadow-lg border-2 border-white"
            >
              Kontak Kami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}