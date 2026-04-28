import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === "change-this-to-a-random-secret") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET 环境变量未设置或仍为默认值，生产环境拒绝启动");
    }
    console.warn("JWT_SECRET 使用不安全默认值，生产环境务必修改");
  }
  return secret || "dev-secret";
}

export function signToken(payload: object, expiresIn: string | number = "24h"): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as jwt.SignOptions);
}

export function verifyToken<T = Record<string, unknown>>(token: string): T | null {
  try {
    return jwt.verify(token, getJwtSecret()) as T;
  } catch {
    return null;
  }
}

export function getUserIdFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken<{ userId: string }>(token);
  return payload?.userId ?? null;
}
