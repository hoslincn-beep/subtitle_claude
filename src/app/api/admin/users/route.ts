import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function checkAuth(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      userId: string;
    };
    return payload.userId;
  } catch {
    return null;
  }
}

// Login
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "请输入用户名和密码" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: admin.id, role: admin.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      success: true,
      data: { token, username: admin.username, role: admin.role },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "登录失败" },
      { status: 500 }
    );
  }
}

// Change password
export async function PUT(request: NextRequest) {
  const userId = checkAuth(request);
  if (!userId) {
    return NextResponse.json({ success: false, error: "未授权" }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await request.json();
    const admin = await prisma.admin.findUnique({ where: { id: userId } });
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "用户不存在" },
        { status: 404 }
      );
    }

    const valid = await bcrypt.compare(oldPassword, admin.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "原密码错误" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return NextResponse.json({ success: true, message: "密码修改成功" });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "修改密码失败" },
      { status: 500 }
    );
  }
}
