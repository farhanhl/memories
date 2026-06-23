import "server-only";
import crypto from "crypto";

/**
 * Enkripsi simetris AES-256-GCM untuk password akun Google Drive (PRD §8).
 *
 * Format penyimpanan: `iv:tag:ciphertext` (semua hex).
 *
 * PENTING: modul ini hanya boleh dipakai di sisi server (Server Actions /
 * Route Handlers). Import "server-only" akan menggagalkan build jika modul
 * ini sampai ter-bundle ke client.
 */
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET belum diset di .env.local.");
  }
  // AES-256 butuh kunci 32 byte. Terima dua format umum:
  //  - 64 karakter hex  → hasil `openssl rand -hex 32` (32 byte)
  //  - 32 karakter teks → 32 byte UTF-8
  if (/^[0-9a-fA-F]{64}$/.test(secret)) {
    return Buffer.from(secret, "hex");
  }
  if (secret.length === 32) {
    return Buffer.from(secret, "utf8");
  }
  throw new Error(
    "ENCRYPTION_SECRET harus 32 karakter teks atau 64 karakter hex (32 byte).",
  );
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((b) => b.toString("hex")).join(":");
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Format data terenkripsi tidak valid.");
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
