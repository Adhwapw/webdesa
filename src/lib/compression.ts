import imageCompression from 'browser-image-compression'

export const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.5,          // Target ukuran: di bawah 500KB (Sangat cukup untuk web)
    maxWidthOrHeight: 1920,  // Resolusi maksimal: 1920px (Full HD)
    useWebWorker: true,      // Proses cepat tanpa bikin browser lag
    fileType: 'image/jpeg'   // Paksa jadi JPG agar lebih ringan
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Gagal kompres gambar:', error)
    return file // Jika gagal, kembalikan file asli (fallback)
  }
}