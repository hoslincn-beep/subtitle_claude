#!/bin/bash
# ============================================
# Playwright 安装脚本
# 用于 SubExtract 项目的浏览器模拟兜底方案
# ============================================

set -e

echo "=========================================="
echo "  SubExtract - Playwright 安装脚本"
echo "=========================================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 已安装: $(node --version)"

# 安装 Playwright Chromium
echo ""
echo "📦 正在安装 Playwright + Chromium..."
npx playwright install chromium

# 安装系统依赖
echo ""
echo "📦 正在安装系统依赖..."
npx playwright install-deps chromium

echo ""
echo "=========================================="
echo "  Playwright 安装完成!"
echo "=========================================="
echo ""
echo "测试安装: npx playwright --version"
