import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/encrypt";
import { DriveList } from "@/components/dashboard/DriveList";
import type { DriveAccount } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drive_accounts")
    .select("*")
    .order("tanggal", { ascending: false });

  // Dekripsi password di server agar bisa ditampilkan langsung di kartu.
  const entries = ((data ?? []) as DriveAccount[]).map((e) => {
    let password: string;
    try {
      password = decrypt(e.password);
    } catch {
      password = "(gagal dekripsi)";
    }
    return { ...e, password };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Koleksi
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
            Perjalanan Tersimpan
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {entries.length > 0
              ? `${entries.length} entri akun Google Drive`
              : "Belum ada entri tersimpan"}
          </p>
        </div>
        <Link href="/tambah" className="btn btn-brand hidden sm:inline-flex">
          <span className="text-base leading-none">+</span> Tambah Entri
        </Link>
      </div>

      {error ? (
        <p className="alert-error">Gagal memuat data: {error.message}</p>
      ) : (
        <DriveList entries={entries} />
      )}
    </div>
  );
}
