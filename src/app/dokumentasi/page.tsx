import { supabase } from "@/lib/supabase";
import { Dokumentasi } from "@/types";
import Image from "next/image";
import { Calendar, ImageOff } from "lucide-react";

// Revalidate data setiap 60 detik
export const revalidate = 60;

async function getDokumentasi() {
  try {
    const { data, error } = await supabase
      .from("dokumentasi")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return (data as Dokumentasi[]) || [];
  } catch (error) {
    console.error("Error fetching dokumentasi:", error);
    return [];
  }
}

export default async function DokumentasiPage() {
  const dokumentasi = await getDokumentasi();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <section className="bg-green-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Galeri Kegiatan Desa</h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">
          Rekam jejak kegiatan dan momen penting yang terjadi di Desa Sukamaju.
        </p>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 -mt-10">
        {dokumentasi.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dokumentasi.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 bg-gray-200 group">
                  {item.foto_url ? (
                    <Image
                      src={item.foto_url}
                      alt={item.judul}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageOff size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-800 shadow-sm">
                    {item.kategori || "Umum"}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={16} className="mr-2" />
                    {new Date(item.tanggal).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm line-clamp-3">
                    {item.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ImageOff className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada dokumentasi</h3>
            <p className="text-gray-500 mt-1">
              Data kegiatan desa belum ditambahkan.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}