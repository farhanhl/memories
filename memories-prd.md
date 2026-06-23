# PRD: Memories
> Project NextJS — Manajemen Akun Google Drive Foto Liburan

---

## 1. Ringkasan Proyek

**Nama Proyek:** Memories  
**Tech Stack:** Next.js 14 (App Router), Supabase, Tailwind CSS  
**Tujuan:** Aplikasi web yang memungkinkan pengguna menyimpan dan mengelola koleksi akun Google Drive yang berisi foto-foto liburan bersama teman, dilengkapi dengan informasi tanggal dan destinasi perjalanan.  
**Akses:** Wajib login sebelum bisa menggunakan fitur apapun.

---

## 2. Fitur Utama

### 2.1 Autentikasi
- Halaman login dengan email & password
- Registrasi akun baru
- Session management menggunakan Supabase Auth
- Middleware proteksi route — semua halaman selain `/login` dan `/register` wajib terautentikasi
- Redirect otomatis ke `/login` jika belum login

### 2.2 Manajemen Entri Google Drive
- Tambah entri baru (akun Google Drive + metadata liburan)
- Lihat daftar semua entri milik user yang login
- Edit entri yang sudah ada
- Hapus entri
- Setiap entri terisolasi per user (user hanya melihat data miliknya sendiri)

### 2.3 Data yang Disimpan per Entri
| Field | Tipe | Keterangan |
|---|---|---|
| `email` | String | Email akun Google Drive |
| `password` | String (encrypted) | Password akun Google Drive |
| `tanggal` | Date | Tanggal liburan |
| `destinasi` | String | Nama destinasi/lokasi liburan |
| `google_drive_url` | String (opsional) | Link langsung ke folder Google Drive |
| `catatan` | Text (opsional) | Catatan tambahan |

---

## 3. Struktur Database (Supabase)

### Tabel: `users`
> Dikelola otomatis oleh Supabase Auth (`auth.users`)

### Tabel: `drive_accounts`
```sql
create table drive_accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  email       text not null,
  password    text not null,         -- disimpan terenkripsi (AES atau vault)
  tanggal     date not null,
  destinasi   text not null,
  drive_url   text,
  catatan     text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Row Level Security: user hanya bisa akses data miliknya sendiri
alter table drive_accounts enable row level security;

create policy "User dapat melihat data miliknya"
  on drive_accounts for select
  using (auth.uid() = user_id);

create policy "User dapat menambah data"
  on drive_accounts for insert
  with check (auth.uid() = user_id);

create policy "User dapat mengubah data miliknya"
  on drive_accounts for update
  using (auth.uid() = user_id);

create policy "User dapat menghapus data miliknya"
  on drive_accounts for delete
  using (auth.uid() = user_id);
```

---

## 4. Struktur Folder Project

```
memories/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Halaman login
│   │   └── register/
│   │       └── page.tsx           # Halaman registrasi
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Layout dengan navbar & proteksi auth
│   │   ├── page.tsx               # Halaman utama — daftar entri
│   │   ├── tambah/
│   │   │   └── page.tsx           # Form tambah entri baru
│   │   └── edit/
│   │       └── [id]/
│   │           └── page.tsx       # Form edit entri
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts       # Callback Supabase Auth
│   ├── layout.tsx                 # Root layout
│   └── middleware.ts              # Proteksi route global
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── dashboard/
│   │   ├── DriveCard.tsx          # Card tampilan satu entri
│   │   ├── DriveList.tsx          # Daftar semua entri
│   │   └── DriveForm.tsx          # Form tambah/edit (shared)
│   └── ui/
│       ├── Navbar.tsx
│       ├── Button.tsx
│       └── Modal.tsx              # Konfirmasi hapus
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Supabase client-side instance
│   │   └── server.ts              # Supabase server-side instance
│   ├── encrypt.ts                 # Fungsi enkripsi/dekripsi password
│   └── validations.ts             # Zod schema validasi form
├── types/
│   └── index.ts                   # TypeScript types & interfaces
├── .env.local                     # Environment variables
└── middleware.ts                  # Next.js middleware (root level)
```

---

## 5. Halaman & Alur Pengguna

### 5.1 Alur Autentikasi
```
[Buka Website]
      │
      ▼
[Middleware cek session]
      │
   ┌──┴──────────────────┐
   │                     │
[Belum login]        [Sudah login]
   │                     │
   ▼                     ▼
[/login]            [/dashboard]
   │
   ├─ Punya akun → Login → /dashboard
   └─ Belum punya → /register → Login → /dashboard
```

### 5.2 Halaman `/login`
- Form: Email + Password
- Tombol "Login"
- Link ke halaman registrasi
- Error handling: "Email atau password salah"
- Redirect ke `/` (dashboard) setelah berhasil

### 5.3 Halaman `/register`
- Form: Email + Password + Konfirmasi Password
- Validasi: password minimal 8 karakter, keduanya harus sama
- Tombol "Daftar"
- Link ke halaman login

### 5.4 Halaman `/` (Dashboard — Daftar Entri)
- Navbar dengan nama user dan tombol logout
- Tombol "+ Tambah Entri" di bagian atas
- Grid/list card yang menampilkan semua entri:
  - Destinasi (judul card)
  - Tanggal liburan
  - Email Google Drive (ditampilkan sebagian, misal: `john***@gmail.com`)
  - Password (tersembunyi, ada tombol "Tampilkan")
  - Tombol Edit & Hapus
- Empty state jika belum ada entri: "Belum ada data. Tambahkan entri pertamamu!"
- Search/filter berdasarkan destinasi (opsional)

### 5.5 Halaman `/tambah`
- Form dengan semua field yang diperlukan
- Validasi client-side menggunakan Zod + React Hook Form
- Tombol "Simpan" dan "Batal"
- Feedback sukses/error setelah submit

### 5.6 Halaman `/edit/[id]`
- Form yang sudah terisi data yang ada
- Sama dengan form tambah, tapi pre-populated
- Update data ke Supabase saat submit

---

## 6. Komponen Utama

### `DriveCard.tsx`
```typescript
interface DriveCardProps {
  id: string
  email: string
  password: string       // sudah terenkripsi, dekripsi saat "Tampilkan" diklik
  tanggal: string
  destinasi: string
  driveUrl?: string
  catatan?: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}
```

### `DriveForm.tsx`
```typescript
interface DriveFormProps {
  mode: 'tambah' | 'edit'
  defaultValues?: Partial<DriveFormData>
  onSubmit: (data: DriveFormData) => Promise<void>
}

interface DriveFormData {
  email: string
  password: string
  tanggal: string        // format: YYYY-MM-DD
  destinasi: string
  driveUrl?: string
  catatan?: string
}
```

---

## 7. Environment Variables

```env
# .env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kunci enkripsi untuk password Google Drive (32 karakter)
ENCRYPTION_SECRET=your-32-char-secret-key-here
```

---

## 8. Enkripsi Password

Password akun Google Drive **tidak boleh disimpan dalam plain text**. Gunakan enkripsi simetris AES-256-GCM sebelum menyimpan ke database.

```typescript
// lib/encrypt.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET = process.env.ENCRYPTION_SECRET! // 32 karakter

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv, tag, encrypted].map(b => b.toString('hex')).join(':')
}

export function decrypt(encryptedText: string): string {
  const [ivHex, tagHex, encryptedHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
```

> ⚠️ Dekripsi password **hanya dilakukan di sisi server** (Server Actions atau API Route), tidak pernah di client-side.

---

## 9. Middleware Proteksi Route

```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isPublicRoute = PUBLIC_ROUTES.includes(req.nextUrl.pathname)

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 10. Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

---

## 11. Urutan Implementasi (untuk AI Agent)

Ikuti urutan ini agar tidak ada dependency yang hilang:

1. **Setup project** — `npx create-next-app@latest` dengan TypeScript + Tailwind
2. **Setup Supabase** — buat project, jalankan SQL migration tabel `drive_accounts` + RLS policies
3. **Konfigurasi env** — isi `.env.local` dengan kredensial Supabase
4. **Buat Supabase client** — `lib/supabase/client.ts` dan `lib/supabase/server.ts`
5. **Implementasi enkripsi** — `lib/encrypt.ts`
6. **Buat middleware** — `middleware.ts` untuk proteksi route
7. **Buat halaman auth** — `/login` dan `/register` beserta form components
8. **Buat layout dashboard** — `app/(dashboard)/layout.tsx` dengan Navbar
9. **Buat halaman dashboard** — daftar entri dengan `DriveCard` dan `DriveList`
10. **Buat halaman tambah & edit** — form dengan validasi Zod
11. **Testing end-to-end** — login → tambah entri → edit → hapus → logout

---

## 12. Catatan Keamanan

| Aspek | Implementasi |
|---|---|
| Autentikasi | Supabase Auth (JWT-based) |
| Isolasi data | Row Level Security (RLS) di Supabase |
| Enkripsi password | AES-256-GCM di server-side |
| Proteksi route | Next.js Middleware |
| Validasi input | Zod schema di client & server |
| Environment secrets | `.env.local` — jangan di-commit ke Git |

> ⚠️ Tambahkan `.env.local` ke `.gitignore` sebelum push ke repository.

---

*Dokumen ini dibuat sebagai PRD untuk AI Agent — Memories v1.0*
