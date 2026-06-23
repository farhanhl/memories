"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { login } from "@/app/actions/auth";
import { LoginSchema, type LoginData } from "@/lib/validations";

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginData) {
    setServerError(null);
    const result = await login(values);
    // Bila login sukses, server action melakukan redirect (tak ada return).
    if (result?.error) {
      setServerError(result.error);
    }
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="superuser@email.com"
          autoComplete="email"
          className={`field ${errors.email ? "field-invalid" : ""}`}
          {...register("email")}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          className={`field ${errors.password ? "field-invalid" : ""}`}
          {...register("password")}
        />
        {errors.password && (
          <p className="field-error">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="alert-error">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-brand mt-1 w-full"
      >
        {isSubmitting ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
