import { supabase } from "@/lib/supabase";
import { Potensi } from "@/types";
import Image from "next/image";
import { MapPin, ImageOff, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

async function getPotensi() {
  try {
    const { data, error } = await supabase
      .from("potensi")
      .select("*")
      .eq("status", "aktif") // Hanya ambil yang aktif
      .order("id", { ascending: true });

    if (error) throw error;
    return (data as Potensi[]) || [];
  } catch (error) {
    console.error("Error fetching potensi:", error);
    return [];
  }
}

export default async function PotensiPage() {
  const potensi = await getPotensi();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <section className="bg-blue-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Potensi Desa Sukamaju</h1>
        <p className="text-blue-100 max-w-2xl mx-auto text-lg">
          Mengenal lebih dekat kekayaan alam, wisata, dan produk unggulan yang
          menjadi kebanggaan desa kami.
        </p>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 -mt-10">
        {potensi.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {potensi.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 bg-gray-200 group">
                  {item.foto_url ? (
                    <Image
                      src={item.foto_url}
                      alt={item.nama}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageOff size={48} />
                    </div>
                  )}
                  {item.kategori && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                      {item.kategori}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.nama}
                  </h3>
                  {item.lokasi && (
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <MapPin size={16} className="mr-1 text-red-500" />
                      {item.lokasi}
                    </div>
                  )}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {item.deskripsi}
                  </p>
                  
                  {/* Footer Card (Opsional) */}
                  <div className="pt-4 border-t border-gray-100 flex items-center text-green-600 text-sm font-medium">
                    <CheckCircle2 size={16} className="mr-2" />
                    Potensi Unggulan
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MapPin className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada data</h3>
            <p className="text-gray-500 mt-1">Data potensi desa belum ditambahkan.</p>
          </div>
        )}
      </section>
    </main>
  );
}