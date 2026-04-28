/**
 * 数据库初始化脚本
 * 创建默认管理员账号和系统配置
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始初始化数据库...\n");

  // 创建默认管理员
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.admin.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      },
    });
    console.log(`✅ 管理员账号已创建: ${adminUsername}`);
  } else {
    console.log(`⚠️  管理员账号已存在: ${adminUsername}`);
  }

  // 初始化系统配置
  const defaultConfigs: Record<string, string> = {
    rate_limit_ip_per_min: "60",
    rate_limit_global_per_min: "1000",
    cache_ttl_hours: "168", // 7 days
    max_retry_count: "3",
    app_version: "1.0.0",
    maintenance_mode: "false",
  };

  for (const [key, value] of Object.entries(defaultConfigs)) {
    await prisma.systemConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  console.log("✅ 系统配置已初始化\n");
  console.log("🎉 数据库初始化完成!");
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
