"use client";

import { useState } from "react";
import type { DriveAccount } from "@/types";

/** Pasangan gradien bertema perjalanan, dipilih deterministik dari destinasi. */
const GRADIENTS: [string, string][] = [
  ["#f59e0b", "#db2777"], // sunset
  ["#0ea5e9", "#4f46e5"], // ocean
  ["#10b981", "#047857"], // forest
  ["#8b5cf6", "#6366f1"], // dusk
  ["#ef4444", "#b45309"], // clay
  ["#14b8a6", "#0891b2"], // lagoon
];

function gradientFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const [a, b] = GRADIENTS[hash % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function formatTanggal(tanggal: string): string {
  const d = new Date(`${tanggal}T00:00:00`);
  if (Number.isNaN(d.getTime())) return tanggal;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function DriveCard({ entry }: { entry: DriveAccount }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${entry.email}|${entry.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia
    }
  }

  return (
    <article className="surface group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-md">
      {/* Banner album */}
      <div
        className="relative flex h-28 items-end p-4"
        style={{ background: gradientFor(entry.destinasi) }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-5 select-none font-display text-[7rem] font-semibold leading-none text-white/20"
        >
          {entry.destinasi.charAt(0).toUpperCase()}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-black/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {formatTanggal(entry.tanggal)}
        </span>
        <h2 className="relative font-display text-xl font-semibold tracking-tight text-white drop-shadow-sm">
          {entry.destinasi}
        </h2>
      </div>

      {/* Detail */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2 text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-stone-400">
              Email
            </span>
            <span className="truncate text-stone-700 dark:text-stone-300">
              {entry.email}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-stone-400">
              Password
            </span>
            <code className="max-w-[60%] truncate rounded-md bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-800 dark:bg-stone-800 dark:text-stone-100">
              {entry.password}
            </code>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="btn btn-outline btn-sm w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
          >
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
          </svg>
          {copied ? "Tersalin!" : "Salin email|password"}
        </button>

        {entry.catatan && (
          <p className="line-clamp-2 border-l-2 border-brand-200 pl-3 text-sm italic text-stone-500 dark:border-brand-900 dark:text-stone-400">
            {entry.catatan}
          </p>
        )}

        <a
          href={entry.drive_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline btn-sm mt-auto w-full"
        >
          Buka folder Google Drive
        </a>
      </div>
    </article>
  );
}
