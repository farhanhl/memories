import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Route yang boleh diakses tanpa login. */
const PUBLIC_ROUTES = ["/login"];

/**
 * Menyegarkan sesi Supabase dan menegakkan proteksi route.
 *
 * Mengikuti pola resmi @supabase/ssr: jangan menyisipkan logika apa pun
 * antara pembuatan client dan `getClaims()`. Kita memakai `getClaims()`
 * (bukan `getSession()`) karena `getSession()` tidak boleh dipercaya di
 * kode server/proxy.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Belum login & mengakses route privat → ke /login.
  if (!claims && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Sudah login & membuka /login → ke dashboard.
  if (claims && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
