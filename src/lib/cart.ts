import { cookies } from "next/headers";

export type CartItem = { id: number; q: number };

const COOKIE = "sepet";

export async function getCart(): Promise<CartItem[]> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map((x) => ({
        id: Number(x?.id),
        q: Math.min(99, Math.max(1, Math.floor(Number(x?.q)))),
      }))
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