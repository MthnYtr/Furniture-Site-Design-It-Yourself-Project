import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "musteri_session";
const key = () => new TextEncoder().encode(process.env.SESSION_SECRET);

export async function musteriOturumAc(userId: number) {
  const token = await new SignJWT({ uid: userId, role: "musteri" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function musteriOturumKapat() {
  (await cookies()).delete(COOKIE);
}

export async function mevcutMusteri() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.role !== "musteri" || typeof payload.uid !== "number") return null;
    return await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { id: true, email: true, name: true, phone: true },
    });
  } catch {
    return null;
  }
}