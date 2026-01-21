export const stripHtml = (html: string | null | undefined, limit: number = 0) => {
  if (!html) return ''

  let text = ''

  // 1. CARI HANYA TAG <P>
  // Regex ini mencari pola <p ...> isi </p>
  // [\s\S]*? digunakan agar bisa menangkap isi meskipun ada enter (multiline)
  const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi)

  if (paragraphs && paragraphs.length > 0) {
    // Jika ditemukan tag <p>, kita gabungkan isinya
    text = paragraphs.join(' ')
  } else {
    // Fallback: Jika TIDAK ADA tag <p> (misal user nulis pendek tanpa enter)
    // Kita ambil seluruh text-nya agar card tidak kosong
    text = html
  }

  // 2. Bersihkan sisa-sisa tag HTML (<b>, <i>, <p> itu sendiri)
  text = text.replace(/<[^>]+>/g, ' ')

  // 3. Bersihkan &nbsp; dan spasi berlebih
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()

  // 4. Potong jumlah kata (Limit)
  if (limit > 0) {
    const words = text.split(' ')
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...'
    }
  }

  return text
}