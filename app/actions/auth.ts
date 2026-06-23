"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginSchema, type LoginData } from "@/lib/validations";

/**
 * Login superuser memakai email & password (Supabase Auth).
 * Mengembalikan `{ error }` bila gagal; melakukan redirect ke dashboard
 * bila berhasil.
 */
export async function login(
  data: LoginData,
): Promise<{ error: string } | void> {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: "Email atau password salah" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email atau password salah" };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/** Logout & kembali ke halaman login. */
export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
