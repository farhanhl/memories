import Link from "next/link";
import { notFound } from "next/navigation";
import { DriveForm } from "@/components/dashboard/DriveForm";
import { updateDrive } from "@/app/actions/drive";
import { createClient } from "@/lib/supabase/server";
import type { DriveAccount } from "@/types";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drive_accounts")
    .select("*")
    .eq("id", id)
    .single<DriveAccount>();

  if (error || !data) {
    notFound();
  }

  // Password sengaja tidak didekripsi/diisi; superuser memasukkan ulang.
  const updateAction = updateDrive.bind(null, id);

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
          Edit Entri
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Perbarui detail untuk{" "}
          <span className="font-medium text-stone-700 dark:text-stone-300">
            {data.destinasi}
          </span>
          .
        </p>
      </div>

      <div className="surface p-6 sm:p-8">
        <DriveForm
          mode="edit"
          action={updateAction}
          defaultValues={{
            email: data.email,
            password: "",
            tanggal: data.tanggal,
            destinasi: data.destinasi,
            driveUrl: data.drive_url,
            catatan: data.catatan ?? "",
          }}
        />
      </div>
    </div>
  );
}
