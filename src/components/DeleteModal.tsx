'use client'

import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  // Tambahkan props opsional ini agar error hilang:
  title?: string;
  message?: string;
}

export default function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  title = "Hapus Data?", // Default value jika tidak diisi
  message = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan." // Default value
}: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-200">
      {/* Container Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 scale-100">
        
        {/* Tombol Close di Pojok */}
        <button 
            onClick={onClose} 
            disabled={loading}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
            <X size={20} />
        </button>

        <div className="p-6 text-center">
          {/* Ikon Peringatan */}
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50/50">
            <AlertTriangle className="text-red-600" size={32} />
          </div>

          {/* Judul & Pesan Dinamis */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}