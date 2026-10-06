import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export class GorselHatasi extends Error {}

const TURLER: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/jfif": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const UZANTILAR = [".jpg", ".jpeg", ".png", ".webp", ".jfif"];

// Dosya seçilmediyse null döner. Seçilmiş ama kabul edilemeyen dosyada GorselHatasi fırlatır.
export async function gorselKaydet(f: FormDataEntryValue | null): Promise<string | null> {
  if (!(f instanceof File) || f.size === 0) return null;

  let uzanti = TURLER[f.type];
  if (!uzanti) {
    const u = path.extname(f.name).toLowerCase();
    if (UZANTILAR.includes(u)) uzanti = u === ".jfif" ? ".jpg" : u;
  }
  if (!uzanti) throw new GorselHatasi("tur");
  if (f.size > 10 * 1024 * 1024) throw new GorselHatasi("boyut");

  const klasor = path.join(process.cwd(), "uploads");
  await mkdir(klasor, { recursive: true });
  const ad = `${randomUUID()}${uzanti}`;
  await writeFile(path.join(klasor, ad), Buffer.from(await f.arrayBuffer()));
  return `/uploads/${ad}`;
}

export async function gorselSil(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "uploads", path.basename(url)));
  } catch {
    /* dosya zaten yoksa sorun değil */
  }
}