# Memories — Panduan Setup

Aplikasi single-superuser untuk menyimpan & mengelola akun Google Drive berisi
foto liburan. Dibangun dengan **Next.js 16 (App Router), React 19, Tailwind v4,
flowbite-react, dan Supabase (@supabase/ssr)**.

> Catatan: PRD menargetkan stack lama (Next 14, Tailwind v3,
> `@supabase/auth-helpers`, `middleware.ts`). Implementasi ini mengikuti
> *maksud* PRD pada stack yang benar-benar terpasang. Perubahan penting:
> `middleware.ts` → **`proxy.ts`** (Next 16), `auth-helpers` → **`@supabase/ssr`**,
> dan **RLS diaktifkan** (lihat bagian Keamanan).

## 1. Prasyarat

- Node.js 20+
- Akun Supabase (gratis): https://supabase.com

## 2. Install dependency

```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` diperlukan karena konflik peer-dependency bawaan tooling
> pada lingkungan ini. `overrides.@next/font` di `package.json` juga sengaja
> ditambahkan agar resolusi paket berhasil (paket itu tidak pernah di-import).

## 3. Siapkan project Supabase

1. Buat project baru di https://supabase.com/dashboard.
2. Buka **SQL Editor** → tempel isi `supabase/migrations/0001_init.sql` → **Run**.
   Ini membuat tabel `drive_accounts` + RLS + policy + trigger `updated_at`.
3. **Matikan sign-up publik** (penting untuk model single-superuser):
   **Authentication → Sign In / Providers → Email → nonaktifkan "Allow new users to sign up"**
   (atau aktifkan "Confirm email" + jangan bagikan link daftar).

## 4. Buat akun superuser (manual)

**Authentication → Users → Add user** → isi email & password → centang
**Auto Confirm User** agar bisa langsung login.

## 5. Konfigurasi environment

```bash
cp .env.local.example .env.local
```

Isi `.env.local`:

| Variabel | Sumber |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → Data API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → publishable key (nama lama `NEXT_PUBLIC_SUPABASE_ANON_KEY` juga didukung) |
| `ENCRYPTION_SECRET` | 64 karakter hex (`openssl rand -hex 32`) atau 32 karakter teks |

> ⚠️ Jika `ENCRYPTION_SECRET` berubah setelah ada data, password lama tidak bisa
> didekripsi lagi. Tetapkan sekali dan simpan dengan aman.

## 6. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 → otomatis diarahkan ke `/login`. Masuk dengan akun
superuser → dashboard.

## Alur aplikasi

- `/login` — form login (redirect ke `/` jika sudah login)
- `/` — daftar entri (grid responsif), tombol Tambah, reveal password, edit, hapus
- `/tambah` — form tambah entri
- `/edit/[id]` — form edit (password diisi ulang demi keamanan)

## Keamanan

- **Password Google Drive**: dienkripsi AES-256-GCM (`lib/encrypt.ts`), didekripsi
  **hanya di server** lewat Server Action `revealPassword` saat tombol "Tampilkan"
  ditekan.
- **RLS aktif** dengan policy `for all to authenticated`. Karena sign-up dimatikan,
  hanya superuser yang bisa terautentikasi → setara "akses penuh hanya superuser",
  tetapi tabel tetap aman dari akses anon (berbeda dari PRD yang menyarankan tanpa
  RLS, yang tidak aman karena anon key bersifat publik).
- **Proteksi route**: `proxy.ts` (pengganti middleware di Next 16) +
  pengecekan `getClaims()` di layout dashboard (defense-in-depth).
- Tidak memakai service-role key di aplikasi — semua CRUD lewat client
  ber-cookie (role `authenticated`).

## Struktur

```
app/
  (auth)/login/page.tsx
  (dashboard)/{layout,page}.tsx, tambah/, edit/[id]/
  actions/{auth,drive}.ts        # Server Actions
components/{auth,dashboard,ui}/
lib/supabase/{client,server,proxy}.ts
lib/{encrypt,validations}.ts
types/index.ts
proxy.ts                          # proteksi route global
supabase/migrations/0001_init.sql
```
