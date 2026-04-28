#!/bin/bash
# ============================================
# yt-dlp 安装脚本
# 用于 SubExtract 项目的字幕提取核心依赖
# ============================================

set -e

echo "=========================================="
echo "  SubExtract - yt-dlp 安装脚本"
echo "=========================================="

# 检查 Python 3
if ! command -v python3 &> /dev/null; then
    echo "❌ 请先安装 Python 3.8+"
    echo "   Ubuntu/Debian: sudo apt install python3 python3-pip"
    echo "   macOS: brew install python3"
    exit 1
fi

echo "✅ Python3 已安装: $(python3 --version)"

# 安装 yt-dlp
echo ""
echo "📦 正在安装 yt-dlp..."
python3 -m pip install -U yt-dlp

# 验证安装
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp 安装成功: $(yt-dlp --version)"
else
    # 尝试使用 python -m 方式
    if python3 -m yt_dlp --version &> /dev/null; then
        echo "✅ yt-dlp 安装成功 (Python 模块)"
        echo "💡 创建软链接: sudo ln -s $(which python3) /usr/local/bin/yt-dlp"
    else
        echo "❌ yt-dlp 安装失败"
        exit 1
    fi
fi

echo ""
echo "=========================================="
echo "  yt-dlp 安装完成!"
echo "=========================================="
echo ""
echo "测试安装: yt-dlp --version"
echo "测试字幕提取: yt-dlp --list-subs 'https://www.youtube.com/watch?v=jNQXAC9IVRw'"
