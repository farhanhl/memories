"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DriveFormSchema, type DriveFormData } from "@/lib/validations";

export function DriveForm({
  mode,
  defaultValues,
  action,
}: {
  mode: "tambah" | "edit";
  defaultValues?: Partial<DriveFormData>;
  action: (data: DriveFormData) => Promise<{ error: string } | void>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DriveFormData>({
    resolver: zodResolver(DriveFormSchema),
    defaultValues: {
      email: defaultValues?.email ?? "",
      password: defaultValues?.password ?? "",
      tanggal: defaultValues?.tanggal ?? "",
      destinasi: defaultValues?.destinasi ?? "",
      driveUrl: defaultValues?.driveUrl ?? "",
      catatan: defaultValues?.catatan ?? "",
    },
  });

  async function onSubmit(values: DriveFormData) {
    setServerError(null);
    const result = await action(values);
    if (result?.error) {
      setServerError(result.error);
    }
    // Sukses → server action melakukan redirect ke "/".
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="destinasi" className="field-label">
            Destinasi
          </label>
          <input
            id="destinasi"
            placeholder="Bali, Lombok, dll."
            className={`field ${errors.destinasi ? "field-invalid" : ""}`}
            {...register("destinasi")}
          />
          {errors.destinasi && (
            <p className="field-error">{errors.destinasi.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tanggal" className="field-label">
            Tanggal Liburan
          </label>
          <input
            id="tanggal"
            type="date"
            className={`field ${errors.tanggal ? "field-invalid" : ""}`}
            {...register("tanggal")}
          />
          {errors.tanggal && (
            <p className="field-error">{errors.tanggal.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email Google Drive
        </label>
        <input
          id="email"
          type="email"
          placeholder="contoh@gmail.com"
          className={`field ${errors.email ? "field-invalid" : ""}`}
          {...register("email")}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password Google Drive
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className={`field ${errors.password ? "field-invalid" : ""}`}
          {...register("password")}
        />
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}
        {mode === "edit" && (
          <p className="mt-1.5 text-xs text-stone-400">
            Masukkan ulang password (password lama tidak ditampilkan demi
            keamanan).
          </p>
        )}
      </div>

      <div>
        <label htmlFor="driveUrl" className="field-label">
          Link Google Drive
        </label>
        <input
          id="driveUrl"
          type="url"
          placeholder="https://drive.google.com/drive/folders/…"
          className={`field ${errors.driveUrl ? "field-invalid" : ""}`}
          {...register("driveUrl")}
        />
        {errors.driveUrl && (
          <p className="field-error">{errors.driveUrl.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="catatan" className="field-label">
          Catatan{" "}
          <span className="font-normal text-stone-400">(opsional)</span>
        </label>
        <textarea
          id="catatan"
          rows={3}
          placeholder="Tambahkan catatan…"
          className="field resize-y"
          {...register("catatan")}
        />
      </div>

      {serverError && <p className="alert-error">{serverError}</p>}

      <div className="mt-1 flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-brand w-full sm:w-auto"
        >
          {isSubmitting
            ? "Menyimpan…"
            : mode === "tambah"
              ? "Simpan entri"
              : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-ghost w-full sm:w-auto"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
