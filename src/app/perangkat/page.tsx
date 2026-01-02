import { supabase } from "@/lib/supabase";
import { PerangkatDesa } from "@/types";
import Image from "next/image";
import { Users, User, ImageOff } from "lucide-react";

export const revalidate = 60;

async function getPerangkat() {
  try {
    const { data, error } = await supabase
      .from("perangkat_desa")
      .select("*")
      .eq("status", "aktif")
      .order("urutan", { ascending: true }); // Penting: Urutkan dari 1, 2, 3 dst

    if (error) throw error;
    return (data as PerangkatDesa[]) || [];
  } catch (error) {
    console.error("Error fetching perangkat:", error);
    return [];
  }
}

export default async function PerangkatPage() {
  const perangkat = await getPerangkat();

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <section className="bg-gray-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Struktur Organisasi Desa</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg">
          Mengenal jajaran pemerintahan Desa Citamiang yang siap melayani masyarakat.
        </p>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 -mt-10">
        {perangkat.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {perangkat.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className="relative mx-auto mt-6 w-40 h-40 rounded-full overflow-hidden border-4 border-green-50 shadow-md">
                  {item.foto_url ? (
                    <Image
                      src={item.foto_url}
                      alt={item.nama_lengkap}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {item.nama_lengkap}
                  </h3>
                  <p className="text-green-600 font-medium text-sm mb-3">
                    {item.jabatan}
                  </p>
                  
                  {/* Badge Urutan (Opsional, untuk debug) */}
                  {/* <span className="inline-block bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                    Urutan: {item.urutan}
                  </span> */}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Users className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Belum ada data</h3>
            <p className="text-gray-500 mt-1">Struktur organisasi belum ditambahkan.</p>
          </div>
        )}
      </section>
    </main>
  );
}