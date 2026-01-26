import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

 const {
    data: { user },
  } = await supabase.auth.getUser()

  // === PERBAIKAN DI SINI ===
  
  // Daftar halaman admin yang boleh diakses TANPA login (Public Admin Pages)
  const isPublicAdminPage = 
     request.nextUrl.pathname === '/admin/login' || 
     request.nextUrl.pathname === '/admin/lupa-password' ||
     request.nextUrl.pathname === '/admin/update-password'

  // 1. Jika user BELUM login dan mencoba akses halaman /admin (selain halaman public tadi)
  if (!user && request.nextUrl.pathname.startsWith('/admin') && !isPublicAdminPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  // 2. Jika user SUDAH login dan mencoba akses halaman login/lupa password, lempar ke dashboard
  if (user && isPublicAdminPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}