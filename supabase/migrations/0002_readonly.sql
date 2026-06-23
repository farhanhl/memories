-- Jadikan drive_accounts append-only.
-- Jalankan di Supabase SQL Editor untuk database yang SUDAH memakai 0001 lama
-- (yang punya policy "authenticated full access").
--
-- Setelah ini: superuser hanya bisa MEMBACA dan MENAMBAH entri.
-- UPDATE & DELETE ditolak oleh RLS karena tidak ada policy-nya — termasuk
-- bila dicoba langsung lewat Data API, bukan hanya lewat UI.

drop policy if exists "authenticated full access" on public.drive_accounts;
drop policy if exists "authenticated read" on public.drive_accounts;
drop policy if exists "authenticated insert" on public.drive_accounts;

create policy "authenticated read" on public.drive_accounts
  for select to authenticated using (true);

create policy "authenticated insert" on public.drive_accounts
  for insert to authenticated with check (true);
