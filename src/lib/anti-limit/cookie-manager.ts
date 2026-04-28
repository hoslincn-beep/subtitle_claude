import { prisma } from "@/lib/db";

export async function getCookies(platform: string): Promise<string | null> {
  const store = await prisma.cookieStore.findUnique({
    where: { platform },
  });
  if (!store || !store.isActive) return null;
  return store.cookies;
}

export async function setCookies(platform: string, cookies: string): Promise<void> {
  await prisma.cookieStore.upsert({
    where: { platform },
    create: {
      platform,
      cookies,
      isActive: true,
    },
    update: {
      cookies,
      isActive: true,
    },
  });
}

export async function deactivateCookies(platform: string): Promise<void> {
  await prisma.cookieStore.update({
    where: { platform },
    data: { isActive: false },
  });
}

export async function getAllCookieStatus(): Promise<
  { platform: string; isActive: boolean; updatedAt: Date }[]
> {
  const stores = await prisma.cookieStore.findMany();
  return stores.map((s) => ({
    platform: s.platform,
    isActive: s.isActive,
    updatedAt: s.updatedAt,
  }));
}
