import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Proxy (sebelumnya bernama "middleware" di Next.js <16).
 * Menyegarkan sesi Supabase pada setiap request & memproteksi route.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path KECUALI:
     * - _next/static, _next/image (aset build)
     * - favicon.ico & file gambar statis
     * - api (route handler menangani auth-nya sendiri)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
