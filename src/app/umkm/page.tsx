import { supabase } from "@/lib/supabase";
import { UMKM } from "@/types";
import Image from "next/image";
import { Store, User, Phone, ImageOff } from "lucide-react";

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
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
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

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.nama_umkm}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <User size={16} className="mr-2 text-orange-500" />
                    Pemilik: {item.pemilik}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                    {item.deskripsi}
                  </p>

                  <a
                    href={`https://wa.me/${item.kontak?.replace(/^0/, "62")}`} // Auto convert 08xx ke 628xx
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Phone size={18} />
                    Hubungi Penjual
                  </a>
                </div>
              </div>
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