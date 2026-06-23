/** Bentuk baris tabel `drive_accounts` di Supabase. */
export interface DriveAccount {
  id: string;
  email: string;
  /** Password terenkripsi (AES-256-GCM, format `iv:tag:ciphertext`). */
  password: string;
  tanggal: string; // YYYY-MM-DD
  destinasi: string;
  drive_url: string;
  catatan: string | null;
  created_at: string;
  updated_at: string;
}

export type { DriveFormData, LoginData } from "@/lib/validations";
