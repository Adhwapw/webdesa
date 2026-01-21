import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 60;

async function getDetailDokumentasi(id: string) {
  const { data } = await supabase.from('dokumentasi').select('*').eq('id', id).single()
  return data
}

export default async function DokumentasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params karena di Next.js 15 params adalah Promise
  const { id } = await params

  const data = await getDetailDokumentasi(id)
  
  if (!data) return notFound()

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-10">
      <article className="max-w-4xl mx-auto px-4">
        
        <Link href="/dokumentasi" className="inline-flex items-center gap-2 text-green-700 font-bold hover:underline mb-6">
            <ArrowLeft size={20} /> Kembali ke Galeri
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-sm">
                    {data.kategori}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar size={16} className="mr-2" />
                    {new Date(data.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {data.judul}
            </h1>
            
            <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-8 border border-gray-100">
                {data.foto_url ? (
                    <Image src={data.foto_url} alt={data.judul} fill className="object-cover" />
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