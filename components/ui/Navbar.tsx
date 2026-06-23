"use client";

import { Dropdown, DropdownHeader, DropdownItem } from "flowbite-react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Wordmark } from "@/components/ui/Logo";

export function AppNavbar({ userEmail }: { userEmail: string }) {
  const initial = userEmail.charAt(0).toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-canvas/70 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="text-brand-700 transition-opacity hover:opacity-80 dark:text-brand-400"
        >
          <Wordmark />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/tambah" className="btn btn-brand btn-sm">
            <span className="text-base leading-none">+</span>
            <span className="hidden sm:inline">Tambah Entri</span>
            <span className="sm:hidden">Tambah</span>
          </Link>

          <Dropdown
            inline
            arrowIcon={false}
            label={
              <span className="flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 py-1 pl-1 pr-2.5 text-sm transition-colors hover:border-brand-300 dark:border-stone-700 dark:bg-stone-800/70">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 font-display text-sm font-semibold text-white">
                  {initial}
                </span>
                <span className="hidden max-w-[10rem] truncate text-stone-600 dark:text-stone-300 sm:inline">
                  {userEmail}
                </span>
              </span>
            }
          >
            <DropdownHeader>
              <span className="block text-sm font-medium">Superuser</span>
              <span className="block truncate text-sm text-stone-500">
                {userEmail}
              </span>
            </DropdownHeader>
            <DropdownItem
              onClick={() => {
                void logout();
              }}
            >
              Keluar
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
