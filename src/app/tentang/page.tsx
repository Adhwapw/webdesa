'use client'

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ProfilDesa, PerangkatDesa } from "@/types";
import Image from "next/image";
import { Target, History, Map, Users, BookOpen, MapPin, Loader2 } from "lucide-react";

export default function TentangPage() {
    const [profil, setProfil] = useState<ProfilDesa | null>(null);
    const [kepalaDesa, setKepalaDesa] = useState<PerangkatDesa | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // 1. Ambil Data Profil Desa
            const { data: profilData } = await supabase
                .from("profil_desa")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (profilData) setProfil(profilData);

            // 2. Ambil Data Kepala Desa dari tabel perangkat
            const { data: perangkatData } = await supabase
                .from("perangkat")
                .select("*")
                .ilike("jabatan", "%Kepala Desa%")
                .limit(1)
                .maybeSingle();

            if (perangkatData) setKepalaDesa(perangkatData);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
                <p className="text-gray-500 font-medium">Memuat Profil Desa...</p>
            </div>
        );
    }

    // Helper untuk memisahkan Misi (asumsi dipisah baris baru di database)
    const misiList = profil?.misi ? profil.misi.split('\n').filter(item => item.trim() !== "") : [];

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* 1. Header Hero Section */}
            <section className="relative h-[400px] bg-green-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/public/images/gambar drone maniis.jpg"
                        alt="Desa Citamiang"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Tentang {profil?.nama_desa || 'Desa Citamiang'}
                    </h1>
                    <p className="text-green-100 text-lg md:text-xl">
                        Membangun Desa yang Maju, Mandiri, dan Berdaya Saing.
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
                        <div className="md:w-2/3 text-gray-600 leading-relaxed">
                            {profil?.sejarah ? (
                                <div className="whitespace-pre-line space-y-4">
                                    {profil.sejarah}
                                </div>
                            ) : (
                                <p>Data profil dan sejarah belum diisi di halaman pengaturan.</p>
                            )}
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
                            &ldquo;{profil?.visi || 'Visi belum diatur.'}&rdquo;
                        </p>
                    </div>

                    {/* Misi */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <BookOpen className="text-green-600" /> Misi
                        </h3>
                        <ul className="space-y-4">
                            {misiList.length > 0 ? misiList.map((misi, index) => (
                                <li key={index} className="flex items-start gap-3 text-gray-600">
                                    <span className="bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                    </span>
                                    {misi}
                                </li>
                            )) : (
                                <li className="text-gray-500 italic">Misi belum diatur.</li>
                            )}
                        </ul>
                    </div>
                </section>

                {/* 4. Profil Wilayah */}
                <section>
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-800">Geografis Desa</h2>
                        <p className="text-gray-500 mt-2">Kewilayahan {profil?.nama_desa || 'Desa Citamiang'}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Batas Wilayah - Tetap statis jika tidak ada di DB, atau hubungkan ke Alamat */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <Map size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Alamat Kantor</h4>
                            <p className="text-sm text-gray-600 leading-tight">
                                {profil?.alamat_lengkap || 'Alamat belum diatur.'}
                            </p>
                        </div>

                        {/* Luas Wilayah (Contoh Statis karena di Pengaturan belum ada field Luas) */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                                <MapPin size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Luas Wilayah</h4>
                            <p className="text-3xl font-bold text-gray-800">545 <span className="text-sm font-normal text-gray-500">Ha</span></p>
                            <p className="text-sm text-gray-500 mt-1">Data Kecamatan Maniis.</p>
                        </div>

                        {/* Potensi Utama */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                                <Users size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Kontak Desa</h4>
                            <p className="text-sm text-gray-600">
                                WA: {profil?.telepon || '-'}<br />
                                Email: {profil?.email || '-'}
                            </p>
                        </div>

                        {/* Kepala Desa Dinamis */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center text-green-600 mb-4">
                                <Users size={24} />
                            </div>
                            <h4 className="font-bold text-gray-800 mb-2">Kepala Desa</h4>
                            <p className="text-2xl font-bold text-gray-800 line-clamp-1">
                                {kepalaDesa?.nama_lengkap || 'Belum Diatur'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Jabatan Aktif</p>
                        </div>
                    </div>
                </section>

                {/* 5. Peta Lokasi */}
                <section className="bg-white rounded-2xl shadow-lg p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 px-2">Peta Lokasi</h3>
                    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-200 relative">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31713.48839075355!2d107.2882199!3d-6.6857189!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69a9978a3c898b%3A0x82f6e52c80327f98!2sCitamiang%2C%20Maniis%2C%20Purwakarta%20Regency%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                        ></iframe>
                    </div>
                </section>

            </div>
        </main>
    );
}