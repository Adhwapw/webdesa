import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 60;

async function getDetailPotensi(id: string) {
  const { data } = await supabase.from('potensi').select('*').eq('id', id).single()
  return data
}

export default async function PotensiDetailPage({ params }: { params: { id: string } }) {
  const data = await getDetailPotensi(params.id)
  if (!data) return notFound()

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-10">
      <article className="max-w-4xl mx-auto px-4">
        
        <Link href="/potensi" className="inline-flex items-center gap-2 text-green-700 font-bold hover:underline mb-6">
            <ArrowLeft size={20} /> Kembali ke Daftar Potensi
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                    {data.kategori}
                </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {data.nama_potensi}
            </h1>
            
            <div className="flex items-center gap-2 text-gray-600 mb-8 font-medium">
                <MapPin size={18} className="text-red-500" />
                <span>Lokasi: {data.lokasi}</span>
            </div>

            <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-8 border border-gray-100">
                {data.foto_url ? (
                    <Image src={data.foto_url} alt={data.nama_potensi} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>

            <div 
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: data.deskripsi }} 
            />
        </div>
      </article>
    </main>
  )
}