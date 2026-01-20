import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Store, User, ArrowLeft, Phone } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 60;

async function getDetailUMKM(id: string) {
  const { data } = await supabase.from('umkm').select('*').eq('id', id).single()
  return data
}

export default async function UMKMDetailPage({ params }: { params: { id: string } }) {
  const data = await getDetailUMKM(params.id)
  if (!data) return notFound()

  // Format nomor WA (ganti 08xx jadi 628xx)
  const waNumber = data.kontak.replace(/^0/, '62')
  const waLink = `https://wa.me/${waNumber}?text=Halo, saya lihat produk ${data.nama_umkm} di website desa. Apakah stok masih ada?`

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-10">
      <article className="max-w-4xl mx-auto px-4">
        
        <Link href="/umkm" className="inline-flex items-center gap-2 text-green-700 font-bold hover:underline mb-6">
            <ArrowLeft size={20} /> Kembali ke Daftar UMKM
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm">
                    {data.kategori}
                </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {data.nama_umkm}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-600 mb-8 font-medium">
                <User size={18} />
                <span>Pemilik: {data.pemilik}</span>
            </div>

            {/* Gambar */}
            <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-8 border border-gray-100">
                {data.foto_url ? (
                    <Image src={data.foto_url} alt={data.nama_umkm} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>

            {/* Tombol WA */}
            <a 
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full md:w-auto items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl mb-8 active:scale-95"
            >
                <Phone size={24} />
                Pesan Sekarang via WhatsApp
            </a>

            {/* Isi Artikel */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Deskripsi Produk</h3>
            <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }} 
            />
        </div>
      </article>
    </main>
  )
}