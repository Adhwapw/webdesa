// src/types/index.ts

export interface Dokumentasi {
  id: number;
  judul: string;
  deskripsi: string;
  foto_url: string | null;
  tanggal: string;
  kategori: string;
  created_at?: string;
}

export interface Potensi {
  id: number;
  nama: string;
  deskripsi: string;
  foto_url: string | null;
  kategori: string;
  lokasi: string;
  status: string;
}

export interface UMKM {
  id: number;
  nama_umkm: string;
  pemilik: string;
  deskripsi: string;
  foto_url: string | null;
  kategori: string;
  kontak: string;
  status: string;
}

export interface PerangkatDesa {
  id: number;
  nama_lengkap: string;
  jabatan: string;
  foto_url: string | null;
  urutan: number;
  status: string;
}

export interface AdminUser {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: string;
}

export interface Banner {
  id: number;
  judul: string;
  deskripsi: string;
  foto_url: string | null;
  status: string;
  created_at?: string;
}

export interface ProfilDesa {
  id: number;
  nama_desa: string;
  alamat_lengkap: string;
  telepon: string;
  email: string;
  sejarah: string;
  visi: string;
  misi: string;
  latitude?: string;
  longitude?: string;
}