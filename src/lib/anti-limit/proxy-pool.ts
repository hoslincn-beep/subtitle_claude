import { prisma } from "@/lib/db";

export interface ProxyInfo {
  host: string;
  port: number;
  protocol: string;
  username?: string;
  password?: string;
}

export async function getActiveProxies(): Promise<ProxyInfo[]> {
  const proxies = await prisma.proxyNode.findMany({
    where: { isActive: true },
    orderBy: { failCount: "asc" },
  });
  return proxies.map((p) => ({
    host: p.host,
    port: p.port,
    protocol: p.protocol,
    username: p.username || undefined,
    password: p.password || undefined,
  }));
}

export async function addProxy(proxy: ProxyInfo): Promise<void> {
  await prisma.proxyNode.create({
    data: {
      host: proxy.host,
      port: proxy.port,
      protocol: proxy.protocol,
      username: proxy.username,
      password: proxy.password,
    },
  });
}

export async function markProxyFailed(host: string, port: number): Promise<void> {
  const proxy = await prisma.proxyNode.findFirst({
    where: { host, port },
  });
  if (proxy) {
    const newFailCount = proxy.failCount + 1;
    await prisma.proxyNode.update({
      where: { id: proxy.id },
      data: {
        failCount: newFailCount,
        isActive: newFailCount < 5, // Deactivate after 5 failures
        lastCheck: new Date(),
      },
    });
  }
}

export async function checkProxyHealth(host: string, port: number): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`https://httpbin.org/ip`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok;
  } catch {
    return false;
  }
}

export async function removeProxy(id: string): Promise<void> {
  await prisma.proxyNode.delete({ where: { id } });
}
