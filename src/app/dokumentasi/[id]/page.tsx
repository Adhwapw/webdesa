import { supabase } from "@/lib/supabase"
import Image from "next/image"
import { Calendar, ArrowLeft, User } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

// Revalidate setiap 60 detik agar data update tanpa build ulang
export const revalidate = 60;

async function getDetailDokumentasi(id: string) {
  const { data } = await supabase.from('dokumentasi').select('*').eq('id', id).single()
  return data
}

export default async function DokumentasiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getDetailDokumentasi(id)
  
  if (!data) return notFound()

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24 md:pt-28">
      <article className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <Link 
          href="/dokumentasi" 
          className="inline-flex items-center gap-2 text-green-700 font-bold hover:underline mb-8 transition-colors"
        >
            <ArrowLeft size={20} /> Kembali ke Galeri
        </Link>

        {/* Container Konten Utama */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            
            {/* Bagian Header: Judul & Meta */}
            <div className="p-6 md:p-10 border-b border-gray-100">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {data.kategori || 'Berita Desa'}
                    </span>
                    <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="flex items-center gap-1">
                           <Calendar size={14} />
                           {new Date(data.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {/* Jika ada data penulis, tampilkan */}
                        {data.penulis && (
                           <span className="flex items-center gap-1">
                              <User size={14} /> {data.penulis}
                           </span>
                        )}
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                    {data.judul}
                </h1>
            </div>

            {/* Gambar Utama (Cover) */}
            {data.gambar_url ? (
              <div className="relative w-full aspect-video bg-gray-100">
                 {/* Menggunakan Image dari Next.js dengan object-fit cover */}
                 <Image 
                    src={data.gambar_url}
                    alt={data.judul}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                 />
              </div>
            ) : (
               // Placeholder jika tidak ada gambar
               <div className="w-full h-48 bg-green-50 flex items-center justify-center text-green-300">
                  <span className="italic">Tidak ada gambar sampul</span>
               </div>
            )}

            {/* ISI BERITA / KONTEN ARTIKEL */}
            <div className="p-6 md:p-10">
                <div 
                    className="
                      prose prose-lg prose-green max-w-none 
                      text-gray-800 leading-relaxed 
                      break-words break-all
                      
                      /* STYLING MANUAL UNTUK GAMBAR DALAM KONTEN */
                      [&_img]:w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_img]:shadow-md
                      
                      /* STYLING MANUAL UNTUK PARAGRAF */
                      [&_p]:mb-6 [&_p]:text-base md:[&_p]:text-lg
                      
                      /* STYLING HEADINGS */
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-green-900
                      [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-green-800
                      
                      /* STYLING LIST */
                      [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
                      [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6
                      
                      /* STYLING LINK */
                      [&_a]:text-green-600 [&_a]:underline [&_a]:font-medium hover:[&_a]:text-green-800
                    "
                    dangerouslySetInnerHTML={{ __html: data.deskripsi }} 
                />
            </div>

        </div>
      </article>
    </main>
  )
}