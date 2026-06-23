-- Memories — skema awal
-- Tabel penyimpanan akun Google Drive berisi foto liburan.

create table if not exists public.drive_accounts (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  password    text not null,        -- terenkripsi AES-256-GCM (format iv:tag:ciphertext)
  tanggal     date not null,
  destinasi   text not null,
  drive_url   text not null,
  catatan     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists drive_accounts_tanggal_idx
  on public.drive_accounts (tanggal desc);

-- RLS WAJIB diaktifkan: tabel di schema public terekspos ke Data API, dan
-- anon key bersifat publik (NEXT_PUBLIC_). Tanpa RLS siapa pun bisa membaca
-- baris password terenkripsi.
alter table public.drive_accounts enable row level security;

-- Model append-only untuk superuser: boleh BACA & TAMBAH, tetapi TIDAK boleh
-- ubah/hapus. Karena tidak ada policy UPDATE/DELETE, kedua operasi itu ditolak
-- RLS — bahkan bila dipanggil langsung lewat Data API.
drop policy if exists "authenticated full access" on public.drive_accounts;
drop policy if exists "authenticated read" on public.drive_accounts;
drop policy if exists "authenticated insert" on public.drive_accounts;

create policy "authenticated read" on public.drive_accounts
  for select to authenticated using (true);

create policy "authenticated insert" on public.drive_accounts
  for insert to authenticated with check (true);

-- Jaga kolom updated_at tetap akurat (SECURITY INVOKER — default).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists drive_accounts_set_updated_at on public.drive_accounts;
create trigger drive_accounts_set_updated_at
  before update on public.drive_accounts
  for each row execute function public.set_updated_at();
