import Link from "next/link";
import { DriveForm } from "@/components/dashboard/DriveForm";
import { createDrive } from "@/app/actions/drive";

export default function TambahPage() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-brand-600 dark:text-stone-400"
        >
          ← Kembali ke koleksi
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
          Tambah Entri
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Simpan akun Google Drive baru beserta detail liburannya.
        </p>
      </div>

      <div className="surface p-6 sm:p-8">
        <DriveForm mode="tambah" action={createDrive} />
      </div>
    </div>
  );
}
