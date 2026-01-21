import { supabase } from "@/lib/supabase";
import { UMKM } from "@/types";
import Image from "next/image";
import { Store, User, ImageOff } from "lucide-react";
import Link from "next/link"; // Import Link
import { stripHtml } from "@/lib/utils"; // Import stripHtml

export const revalidate = 60;

async function getUMKM() {
  try {
    const { data, error } = await supabase
      .from("umkm")
      .select("*")
      .eq("status", "aktif")
      .order("id", { ascending: true });

    if (error) throw error;
    return (data as UMKM[]) || [];
  } catch (error) {
    console.error("Error fetching umkm:", error);
    return [];
  }
}

export default async function UMKMPage() {
  const umkm = await getUMKM();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <section className="bg-orange-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">UMKM & Produk Lokal</h1>
        <p className="text-orange-100 max-w-2xl mx-auto text-lg">
          Dukung ekonomi desa dengan membeli produk asli buatan warga Desa Citamiang.
        </p>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 -mt-10">
        {umkm.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {umkm.map((item) => (
              <Link
                href={`/umkm/${item.id}`}
                key={item.id}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                  
                  {/* Gambar */}
                  <div className="relative h-56 bg-gray-200 group">
                    {item.foto_url ? (
                      <Image
                        src={item.foto_url}
                        alt={item.nama_umkm}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageOff size={48} />
                      </div>
                    )}
                    {item.kategori && (
                      <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                        {item.kategori}
                      </div>
                    )}
                  </div>

                  {/* Konten */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-700 transition-colors">
                      {item.nama_umkm}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <User size={16} className="mr-2 text-orange-500" />
                      Pemilik: {item.pemilik}
                    </div>

                    {/* Deskripsi dipotong 8 kata */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                      {stripHtml(item.deskripsi, 8)}
                    </p>

                    {/* Footer "Baca Selengkapnya" (Menggantikan tombol WA agar tidak nested link) */}
                    <div className="mt-auto pt-4 border-t border-gray-100 text-orange-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lihat Detail Produk <span className="text-lg">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Store className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada UMKM</h3>
            <p className="text-gray-500 mt-1">Data UMKM belum ditambahkan.</p>
          </div>
        )}
      </section>
    </main>
  );
}