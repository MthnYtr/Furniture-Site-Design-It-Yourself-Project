import { readFile } from "fs/promises";
import path from "path";

const TIPLER: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const guvenli = path.basename(name);
  const tip = TIPLER[path.extname(guvenli).toLowerCase()];
  if (!tip) return new Response("Bulunamadı", { status: 404 });

  try {
    const veri = await readFile(path.join(process.cwd(), "uploads", guvenli));
    return new Response(new Uint8Array(veri), {
      headers: {
        "Content-Type": tip,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}