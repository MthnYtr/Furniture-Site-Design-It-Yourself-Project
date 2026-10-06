import { cookies } from "next/headers";

// v: seçenek (varyant) numarası, seçeneği olmayan ürünlerde yok
export type CartItem = { id: number; q: number; v?: number };

const COOKIE = "sepet";

export const ayniMi = (a: CartItem, id: number, v?: number) =>
  a.id === id && (a.v ?? 0) === (v ?? 0);

export async function getCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map((x) => {
        const v = Number(x?.v);
        const item: CartItem = {
          id: Number(x?.id),
          q: Math.min(99, Math.max(1, Math.floor(Number(x?.q)))),
        };
        if (Number.isInteger(v) && v > 0) item.v = v;
        return item;
      })
      .filter((x) => Number.isInteger(x.id) && x.id > 0 && Number.isFinite(x.q));
  } catch {
    return [];
  }
}

// Sadece sunucu işlemlerinde (server action) çağrılabilir
export async function saveCart(items: CartItem[]) {
  (await cookies()).set(COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}