import { z } from "zod";

/** Skema form login superuser. */
export const LoginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

/** Skema form tambah/edit entri Google Drive. */
export const DriveFormSchema = z.object({
  email: z.email("Email Google Drive tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal liburan wajib diisi"),
  destinasi: z.string().min(1, "Destinasi wajib diisi"),
  driveUrl: z
    .url("Link tidak valid")
    .refine(
      (v) => v.includes("drive.google.com"),
      "Harus berupa link Google Drive",
    ),
  catatan: z.string().optional(),
});

export type LoginData = z.infer<typeof LoginSchema>;
export type DriveFormData = z.infer<typeof DriveFormSchema>;
