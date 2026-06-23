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

/** Perbarui entri yang sudah ada. */
export async function updateDrive(
  id: string,
  data: DriveFormData,
): Promise<{ error: string } | void> {
  const supabase = await requireAuth();

  const parsed = DriveFormSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Data tidak valid. Periksa kembali isian form." };
  }
  const d = parsed.data;

  const { error } = await supabase
    .from("drive_accounts")
    .update({
      email: d.email,
      password: encrypt(d.password),
      tanggal: d.tanggal,
      destinasi: d.destinasi,
      drive_url: d.driveUrl,
      catatan: d.catatan || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Gagal memperbarui entri. Coba lagi." };
  }

  revalidatePath("/");
  redirect("/");
}

/** Hapus entri. */
export async function deleteDrive(
  id: string,
): Promise<{ error: string } | void> {
  const supabase = await requireAuth();

  const { error } = await supabase.from("drive_accounts").delete().eq("id", id);
  if (error) {
    return { error: "Gagal menghapus entri. Coba lagi." };
  }

  revalidatePath("/");
}
