# Todo Agent

Mac 待办应用 - 基于 Tauri 2.0 + React 18

## 技术栈

- **框架**: Tauri 2.0 + React 18
- **语言**: TypeScript + Rust
- **UI**: Tailwind CSS + Framer Motion
- **状态**: Zustand
- **存储**: SQLite
- **同步**: AWS S3
- **AI**: OpenAI GPT-4o-mini

## 功能特性

- ✅ 待办事项管理（CRUD）
- ✅ 优先级和分类
- ✅ 截图识别（Cmd+Shift+T）
- ✅ 云端同步（S3）
- ✅ 系统提醒通知
- ✅ AI 自动提取待办

## 开发

```bash
# 安装依赖
npm install --legacy-peer-deps

# 开发模式（推荐使用快速启动脚本）
./start.sh

# 或者手动启动
npm run tauri dev

# 构建应用
npm run tauri build
```

## 故障排查

如果遇到白屏"初始化中..."问题：

1. 打开浏览器控制台（Cmd+Option+I 或 F12）查看日志
2. 查看 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) 获取详细解决方案
3. 使用快速启动脚本：`./start.sh`

## 项目结构

详见 [DESIGN.md](./DESIGN.md)

## 开发状态

🚧 开发中...
