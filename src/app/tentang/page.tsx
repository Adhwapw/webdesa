import Image from "next/image";
import { Target, History, Map, Users, BookOpen, MapPin } from "lucide-react";

export const metadata = {
  title: "Tentang Kami | Desa Citamiang Purwakarta",
  description: "Profil, Sejarah, Visi Misi, dan Letak Geografis Desa Citamiang Kecamatan Maniis",
};

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Header Hero Section */}
      <section className="relative h-[400px] bg-green-900 flex items-center justify-center overflow-hidden">
        {/* Background Pattern/Image */}
        <div className="absolute inset-0 opacity-20">
            {/* Ganti dengan foto Taman Desa Citamiang jika sudah ada */}
            <Image 
                src="https://images.unsplash.com/photo-1599580625486-173663b6a95f?q=80&w=1932&auto=format&fit=crop" 
                alt="Pemandangan Alam Purwakarta" 
                fill 
                className="object-cover"
            />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Desa Citamiang</h1>
          <p className="text-green-100 text-lg md:text-xl">
            Membangun Desa di Ujung Selatan Purwakarta yang Asri dan Berdaya Saing.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 space-y-16">
        
        {/* 2. Profil & Sejarah Singkat */}
        <section className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="md:w-1/3 text-center md:text-left">
                    <div className="bg-green-100 text-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto md:mx-0">
                        <History size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Profil Desa</h2>
                    <div className="w-20 h-1.5 bg-green-600 rounded-full mx-auto md:mx-0"></div>
                </div>
                <div className="md:w-2/3 text-gray-600 leading-relaxed space-y-4">
                    <p>
                        Desa Citamiang adalah salah satu desa yang terletak di wilayah <strong>Kecamatan Maniis, Kabupaten Purwakarta</strong>, Jawa Barat. Desa ini dikenal sebagai wilayah yang memiliki potensi pertanian yang kuat serta suasana alam yang masih sangat asri karena letaknya yang strategis di jalur selatan Purwakarta.
                    </p>
                    <p>
                        Nama &quot;Citamiang&quot; sendiri memiliki makna filosofis yang lekat dengan air (&quot;Ci&quot;) dan harapan akan keharuman atau kebaikan. Masyarakat Desa Citamiang memegang teguh nilai gotong royong, yang tercermin dalam pengelolaan <strong>Taman Desa Citamiang</strong>, sebuah ruang terbuka hijau yang kini menjadi ikon kebanggaan desa sebagai pusat aktivitas warga dan wisata lokal.
                    </p>
                    <p>
                        Saat ini, Desa Citamiang terus berbenah di bawah kepemimpinan Bapak <strong>E. Suryana</strong> (Periode 2021-2027), dengan fokus pada pembangunan infrastruktur jembatan penghubung dan pemberdayaan ekonomi masyarakat berbasis pertanian dan UMKM.
                    </p>
                </div>
            </div>
        </section>

        {/* 3. Visi & Misi */}
        <section className="grid md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="bg-green-700 text-white rounded-2xl shadow-lg p-8 md:p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target size={120} />
                </div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Target /> Visi
                </h3>
                <p className="text-lg leading-relaxed font-light italic">
                    &quot;Terwujudnya Desa Citamiang yang Maju, Mandiri, Agamis, dan Sejahtera Melalui Peningkatan Pelayanan Publik dan Optimalisasi Potensi Desa.&quot;
                </p>
            </div>

            {/* Misi */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <BookOpen className="text-green-600" /> Misi
                </h3>
                <ul className="space-y-4">
                    {[
                        "Meningkatkan tata kelola pemerintahan desa yang transparan dan akuntabel.",
                        "Mengembangkan infrastruktur desa untuk menunjang perekonomian warga (Jalan & Jembatan).",
                        "Mengoptimalkan potensi pertanian dan pariwisata lokal (Taman Desa).",
                        "Meningkatkan kualitas sumber daya manusia melalui pendidikan dan kesehatan.",
                        "Menjaga kelestarian lingkungan hidup dan budaya gotong royong."
                    ].map((misi, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-600">
                            <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                {index + 1}
                            </span>
                            {misi}
                        </li>
                    ))}
                </ul>
            </div>
        </section>

        {/* 4. Profil Wilayah (Data Maniis) */}
        <section>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800">Geografis Desa</h2>
                <p className="text-gray-500 mt-2">Data kewilayahan Desa Citamiang, Kecamatan Maniis</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Batas Wilayah */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <Map size={24} />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Batas Wilayah</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>Utara: Desa Cijati</li>
                        <li>Timur: Kab. Bandung Barat</li>
                        <li>Selatan: Desa Sinargalih</li>
                        <li>Barat: Desa Cijati/Jl. Palumbon</li>
                    </ul>
                </div>

                {/* Luas Wilayah */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                        <MapPin size={24} />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Luas Wilayah</h4>
                    <p className="text-3xl font-bold text-gray-800">545 <span className="text-sm font-normal text-gray-500">Ha</span></p>
                    <p className="text-sm text-gray-500 mt-1">Terdiri dari 4 Dusun, 7 RW, 15 RT.</p>
                </div>

                {/* Potensi Utama */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                        <Users size={24} />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Potensi Utama</h4>
                    <p className="text-sm text-gray-600">
                        1. <strong>Pertanian:</strong> Padi & Palawija<br/>
                        2. <strong>Wisata:</strong> Taman Desa Citamiang<br/>
                        3. <strong>Perikanan:</strong> Budidaya air tawar
                    </p>
                </div>

                {/* Aparatur */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4">
                        <Users size={24} />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Kepala Desa</h4>
                    <p className="text-2xl font-bold text-gray-800">E. Suryana</p>
                    <p className="text-sm text-gray-500 mt-1">Periode 2021 - 2027</p>
                </div>
            </div>
        </section>

        {/* 5. Peta Lokasi (Embed Maniis) */}
        <section className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Peta Lokasi Desa Citamiang</h3>
            <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-200 relative">
                {/* Iframe Google Maps Koordinat Citamiang, Maniis */}
                <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31707.391741543884!2d107.3512345!3d-6.666667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69055555555555%3A0x1!2sCitamiang%2C%20Kec.%20Maniis%2C%20Kabupaten%20Purwakarta!5e0!3m2!1sid!2sid!4v1600000000000!5m2!1sid!2sid" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen={true} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>

      </div>
    </main>
  );
}