import { LoginForm } from "@/components/auth/LoginForm";
import { LogoMark, Wordmark } from "@/components/ui/Logo";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen flex-1 lg:grid-cols-2">
      {/* Panel brand — hanya tampil di layar lebar */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 p-12 text-white lg:flex">
        {/* Garis kontur dekoratif */}
        <svg
          className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] text-white/15"
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          {[20, 42, 64, 86].map((r) => (
            <circle
              key={r}
              cx="100"
              cy="100"
              r={r}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          ))}
        </svg>
        <div
          className="pointer-events-none absolute -bottom-16 -left-10 h-72 w-72 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />

        <header className="relative">
          <Wordmark markClassName="text-white" />
        </header>

        <div className="relative max-w-sm">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Simpan setiap perjalanan di satu tempat.
          </h1>
          <p className="mt-4 text-brand-50/90">
            Kelola koleksi akun Google Drive berisi foto-foto liburan bersama
            teman — lengkap dengan tanggal & destinasi.
          </p>
        </div>

        <footer className="relative text-sm text-brand-50/70">
          Akses pribadi · hanya untuk superuser
        </footer>
      </div>

      {/* Panel form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Wordmark className="text-brand-700 dark:text-brand-400" />
          </div>

          <div className="mb-7">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-stone-900 dark:text-white">
              Selamat datang kembali
            </h2>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              Masuk untuk membuka koleksi liburanmu.
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-stone-400">
            <LogoMark className="h-3.5 w-3.5" />
            Memories — kenangan yang tersimpan rapi
          </p>
        </div>
      </div>
    </div>
  );
}
