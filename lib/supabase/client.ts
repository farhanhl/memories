import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk dipakai di Client Components (browser).
 * Memakai anon key yang aman diekspos ke browser (akses tetap dibatasi RLS).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
  );
}
