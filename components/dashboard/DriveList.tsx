import Link from "next/link";
import { DriveCard } from "./DriveCard";
import { LogoMark } from "@/components/ui/Logo";
import type { DriveAccount } from "@/types";

export function DriveList({ entries }: { entries: DriveAccount[] }) {
  if (entries.length === 0) {
    return (
      <div className="surface flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-900/30 dark:text-brand-400">
          <LogoMark className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-xl font-semibold text-stone-800 dark:text-stone-100">
            Belum ada kenangan di sini
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Tambahkan entri pertamamu untuk mulai menyimpan koleksi.
          </p>
        </div>
        <Link href="/tambah" className="btn btn-brand mt-1">
          <span className="text-base leading-none">+</span> Tambah Entri Pertama
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <DriveCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
