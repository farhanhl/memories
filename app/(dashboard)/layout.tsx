import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/ui/Navbar";

/**
 * Layout dashboard — proteksi server-side (defense-in-depth di atas proxy.ts)
 * sesuai panduan Supabase: gunakan getClaims() untuk melindungi halaman.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  const userEmail =
    (claims.email as string | undefined) ?? "superuser";

  return (
    <div className="flex flex-1 flex-col">
      <AppNavbar userEmail={userEmail} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
