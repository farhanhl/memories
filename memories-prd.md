# PRD: Memories
> Project NextJS — Manajemen Akun Google Drive Foto Liburan

---

## 1. Ringkasan Proyek

**Nama Proyek:** Memories  
**Tech Stack:** Next.js 14 (App Router), Supabase, Tailwind CSS, Flowbite  
**Tujuan:** Aplikasi web yang memungkinkan pengguna menyimpan dan mengelola koleksi akun Google Drive yang berisi foto-foto liburan bersama teman, dilengkapi dengan informasi tanggal dan destinasi perjalanan.  
**Akses:** Wajib login sebelum bisa menggunakan fitur apapun.

---

## 2. Fitur Utama

### 2.1 Autentikasi
- Halaman login dengan email & password
- Hanya 1 akun superuser yang bisa login (dibuat manual di Supabase)
- Session management menggunakan Supabase Auth
- Middleware proteksi route — semua halaman selain `/login` wajib terautentikasi
- Redirect otomatis ke `/login` jika belum login

### 2.2 Manajemen Entri Google Drive
- Tambah entri baru (akun Google Drive + metadata liburan)
- Lihat semua entri dari seluruh data yang tersimpan
- Edit entri yang sudah ada
- Hapus entri
- Superuser memiliki akses penuh ke semua data

### 2.3 Data yang Disimpan per Entri
| Field | Tipe | Keterangan |
|---|---|---|
| `email` | String | Email akun Google Drive |
| `password` | String (encrypted) | Password akun Google Drive |
| `tanggal` | Date | Tanggal liburan |
| `destinasi` | String | Nama destinasi/lokasi liburan |
| `google_drive_url` | String | Link langsung ke folder Google Drive |
| `catatan` | Text (opsional) | Catatan tambahan |

---

## 3. Struktur Database (Supabase)

### Tabel: `users`
> Dikelola otomatis oleh Supabase Auth (`auth.users`)

### Tabel: `drive_accounts`
```sql
create table drive_accounts (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  password    text not null,         -- disimpan terenkripsi (AES-256-GCM)
  tanggal     date not null,
  destinasi   text not null,
  drive_url   text not null,
  catatan     text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
```

> ℹ️ Tidak ada RLS — akses database hanya bisa dilakukan setelah login sebagai superuser. Keamanan ditangani di level aplikasi via Supabase Auth + middleware.

**Superuser dibuat manual di Supabase Dashboard:**
> Authentication → Users → Invite user → masukkan email & password superuser.

---

## 4. Struktur Folder Project

```
memories/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx           # Halaman login superuser
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
│   │   └── LoginForm.tsx
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
   └─ Login sebagai superuser → /dashboard
```

### 5.2 Halaman `/login`
- Form: Email + Password
- Tombol "Login"
- Error handling: "Email atau password salah"
- Redirect ke `/` (dashboard) setelah berhasil
- Tidak ada link registrasi — akun superuser dibuat manual di Supabase

### 5.3 Halaman `/` (Dashboard — Daftar Entri)
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

### 5.4 Halaman `/tambah`
- Form dengan semua field yang diperlukan
- Validasi client-side menggunakan Zod + React Hook Form
- Tombol "Simpan" dan "Batal"
- Feedback sukses/error setelah submit

### 5.5 Halaman `/edit/[id]`
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
  driveUrl: string
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
  driveUrl: string
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

const PUBLIC_ROUTES = ['/login']

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

## 10. UI Guidelines — Flowbite & Responsiveness

### 10.1 Setup Flowbite

```bash
npm install flowbite flowbite-react
```

Tambahkan ke `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  plugins: [require('flowbite/plugin')],
}

export default config
```

Tambahkan script Flowbite di `app/layout.tsx`:

```tsx
import { ThemeModeScript } from 'flowbite-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 10.2 Komponen Flowbite yang Digunakan

| Komponen | Digunakan Untuk |
|---|---|
| `<Navbar>` | Navigasi utama dengan hamburger menu di mobile |
| `<Card>` | Tampilan setiap entri Google Drive |
| `<Button>` | Semua tombol aksi (tambah, simpan, hapus, logout) |
| `<TextInput>` | Field email, password, destinasi, URL |
| `<Datepicker>` | Pilih tanggal liburan |
| `<Textarea>` | Field catatan |
| `<Modal>` | Konfirmasi hapus entri |
| `<Alert>` | Pesan sukses / error setelah submit |
| `<Spinner>` | Loading state saat fetch / submit |
| `<Badge>` | Label destinasi pada card |
| `<Toast>` | Notifikasi singkat setelah aksi berhasil |
| `<Dropdown>` | Menu user (profil, logout) di navbar |

### 10.3 Panduan Responsiveness

Gunakan breakpoint Tailwind secara konsisten di seluruh project:

| Breakpoint | Ukuran | Perilaku |
|---|---|---|
| default | < 640px | Mobile — 1 kolom, full width |
| `sm` | ≥ 640px | Tetap 1 kolom |
| `md` | ≥ 768px | 2 kolom grid |
| `lg` | ≥ 1024px | 3 kolom grid |
| `xl` | ≥ 1280px | 3 kolom grid + sidebar spacing |

**Grid card dashboard:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
  {entries.map(entry => <DriveCard key={entry.id} {...entry} />)}
</div>
```

**Navbar — mobile hamburger otomatis via Flowbite:**
```tsx
import { Navbar } from 'flowbite-react'

<Navbar fluid rounded>
  <Navbar.Brand href="/">
    <span className="text-xl font-semibold">Memories</span>
  </Navbar.Brand>
  <Navbar.Toggle /> {/* Otomatis jadi hamburger di mobile */}
  <Navbar.Collapse>
    <Dropdown label={userEmail} inline>
      <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
    </Dropdown>
  </Navbar.Collapse>
</Navbar>
```

**Form — full width di mobile, max-width di desktop:**
```tsx
<div className="min-h-screen flex items-center justify-center p-4">
  <Card className="w-full max-w-md">
    {/* Form login / register */}
  </Card>
</div>
```

**Card entri — teks tidak overflow di layar kecil:**
```tsx
<Card className="w-full">
  <h5 className="text-lg font-bold truncate">{destinasi}</h5>
  <p className="text-sm text-gray-500 truncate">{email}</p>
  {/* ... */}
  <div className="flex flex-col sm:flex-row gap-2 mt-4">
    <Button size="sm" className="w-full sm:w-auto" onClick={onEdit}>Edit</Button>
    <Button size="sm" color="failure" className="w-full sm:w-auto" onClick={onDelete}>Hapus</Button>
  </div>
</Card>
```

### 10.4 Contoh Implementasi Form (Flowbite)

```tsx
import { Button, Label, TextInput, Datepicker, Textarea, Alert } from 'flowbite-react'

export function DriveForm({ mode, defaultValues, onSubmit }: DriveFormProps) {
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email" value="Email Google Drive" />
        <TextInput
          id="email"
          type="email"
          placeholder="contoh@gmail.com"
          {...register('email')}
          color={errors.email ? 'failure' : 'gray'}
          helperText={errors.email?.message}
        />
      </div>

      <div>
        <Label htmlFor="password" value="Password Google Drive" />
        <TextInput
          id="password"
          type="password"
          {...register('password')}
          color={errors.password ? 'failure' : 'gray'}
          helperText={errors.password?.message}
        />
      </div>

      <div>
        <Label htmlFor="tanggal" value="Tanggal Liburan" />
        <Datepicker
          id="tanggal"
          language="id-ID"
          onSelectedDateChanged={(date) => setValue('tanggal', date.toISOString().split('T')[0])}
        />
      </div>

      <div>
        <Label htmlFor="destinasi" value="Destinasi" />
        <TextInput
          id="destinasi"
          placeholder="Bali, Lombok, dll."
          {...register('destinasi')}
          color={errors.destinasi ? 'failure' : 'gray'}
          helperText={errors.destinasi?.message}
        />
      </div>

      <div>
        <Label htmlFor="driveUrl" value="Link Google Drive" />
        <TextInput
          id="driveUrl"
          type="url"
          placeholder="https://drive.google.com/drive/folders/..."
          {...register('driveUrl')}
          color={errors.driveUrl ? 'failure' : 'gray'}
          helperText={errors.driveUrl?.message}
        />
      </div>

      <div>
        <Label htmlFor="catatan" value="Catatan (opsional)" />
        <Textarea
          id="catatan"
          rows={3}
          placeholder="Tambahkan catatan..."
          {...register('catatan')}
        />
      </div>

      {error && <Alert color="failure">{error}</Alert>}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" className="w-full sm:w-auto" isProcessing={isSubmitting}>
          {mode === 'tambah' ? 'Simpan' : 'Update'}
        </Button>
        <Button color="gray" className="w-full sm:w-auto" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  )
}
```

---

## 11. Package Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "@supabase/auth-helpers-nextjs": "^0.8.0",
    "flowbite": "^2.0.0",
    "flowbite-react": "^0.7.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "zod": "^3.0.0",
    "date-fns": "^3.0.0"
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

## 12. Urutan Implementasi (untuk AI Agent)

Ikuti urutan ini agar tidak ada dependency yang hilang:

1. **Setup project** — `npx create-next-app@latest` dengan TypeScript + Tailwind
2. **Setup Flowbite** — install `flowbite` + `flowbite-react`, konfigurasi `tailwind.config.ts`, tambah `ThemeModeScript` di root layout
3. **Setup Supabase** — buat project, jalankan SQL migration tabel `drive_accounts` (tanpa RLS)
4. **Buat superuser** — Supabase Dashboard → Authentication → Users → Invite user
5. **Konfigurasi env** — isi `.env.local` dengan kredensial Supabase
6. **Buat Supabase client** — `lib/supabase/client.ts` dan `lib/supabase/server.ts`
7. **Implementasi enkripsi** — `lib/encrypt.ts`
8. **Buat middleware** — `middleware.ts` untuk proteksi route (hanya `/login` yang public)
9. **Buat halaman login** — menggunakan Flowbite `Card`, `TextInput`, `Button`
10. **Buat layout dashboard** — `app/(dashboard)/layout.tsx` dengan Flowbite `Navbar` (responsive hamburger)
11. **Buat halaman dashboard** — grid card responsive menggunakan Flowbite `Card` + `Badge`
12. **Buat halaman tambah & edit** — form dengan Flowbite `TextInput`, `Datepicker`, `Textarea`, `Alert`
13. **Testing end-to-end** — uji di mobile (375px), tablet (768px), dan desktop (1280px)

---

## 13. Catatan Keamanan

| Aspek | Implementasi |
|---|---|
| Autentikasi | Supabase Auth (JWT-based) |
| Akses data | Single superuser — semua data bisa diakses setelah login |
| Enkripsi password | AES-256-GCM di server-side |
| Proteksi route | Next.js Middleware |
| Validasi input | Zod schema di client & server |
| Environment secrets | `.env.local` — jangan di-commit ke Git |

> ⚠️ Tambahkan `.env.local` ke `.gitignore` sebelum push ke repository.

---

*Dokumen ini dibuat sebagai PRD untuk AI Agent — Memories v1.0*
