"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/encrypt";
import { DriveFormSchema, type DriveFormData } from "@/lib/validations";

/** Pastikan request berasal dari superuser yang sudah login. */
async function requireAuth() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/login");
  }
  return supabase;
}

/** Tambah entri baru. Password dienkripsi sebelum disimpan. */
export async function createDrive(
  data: DriveFormData,
): Promise<{ error: string } | void> {
  const supabase = await requireAuth();

  const parsed = DriveFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid. Periksa kembali isian form." };
  }
  const d = parsed.data;

  const { error } = await supabase.from("drive_accounts").insert({
    email: d.email,
    password: encrypt(d.password),
    tanggal: d.tanggal,
    destinasi: d.destinasi,
    drive_url: d.driveUrl,
    catatan: d.catatan || null,
  });

  if (error) {
    return { error: "Gagal menyimpan entri. Coba lagi." };
  }

  revalidatePath("/");
  redirect("/");
}

// Catatan: entri bersifat append-only — tidak ada server action untuk
// edit/hapus. Penegakan juga di level RLS (lihat migration 0002_readonly.sql),
// sehingga UPDATE/DELETE tetap ditolak meski dipanggil langsung via API.
