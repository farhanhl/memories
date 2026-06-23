import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client untuk dipakai di Server Components, Server Actions, dan
 * Route Handlers. Membaca/menulis sesi lewat cookies Next.js.
 *
 * Di Next.js 16 `cookies()` bersifat async, sehingga fungsi ini async.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Dipanggil dari Server Component — penulisan cookie diabaikan.
            // Penyegaran sesi ditangani oleh proxy.ts.
          }
        },
      },
    },
  );
}
