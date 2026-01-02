import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // Jangan biarkan Google meng-index halaman admin
    },
    sitemap: 'https://desacitamiang.vercel.app/sitemap.xml', // Ganti domain nanti
  }
}