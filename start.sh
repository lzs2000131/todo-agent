#!/bin/bash

echo "🚀 Todo Agent 启动脚本"
echo "====================="
echo ""

# 检查端口占用
echo "1. 检查端口 1420..."
if lsof -Pi :1420 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   ⚠️  端口 1420 被占用，正在清理..."
    lsof -ti:1420 | xargs kill -9 2>/dev/null || true
    echo "   ✅ 端口已清理"
else
    echo "   ✅ 端口可用"
fi

echo ""

# 检查 node_modules
echo "2. 检查依赖安装..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  依赖未安装，开始安装..."
    npm install --legacy-peer-deps
else
    echo "   ✅ 依赖已安装"
fi

echo ""

# 启动应用
echo "3. 启动应用..."
echo "   📝 提示：如果遇到白屏，请按 Cmd+Option+I 打开控制台查看日志"
echo "   📝 详细故障排查请查看 TROUBLESHOOTING.md"
echo ""

npm run tauri dev
