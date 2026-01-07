# Todo Agent - 故障排查指南

## 白屏"初始化中..."问题

### 问题现象
应用启动后一直显示"初始化中..."，无法进入主界面。

### 已修复的问题

1. **数据库初始化改进**
   - 添加了详细的控制台日志
   - 改进了错误处理逻辑
   - 修复了 COUNT 查询结果解析

2. **权限配置更新**
   - 添加了明确的 SQL 插件权限：
     - `sql:allow-load`
     - `sql:allow-execute`
     - `sql:allow-select`

3. **错误显示**
   - 添加了错误状态界面
   - 现在会显示具体的错误信息
   - 提供"重新加载"按钮

### 调试步骤

#### 1. 检查浏览器控制台

在开发模式下，打开浏览器开发者工具（F12 或 Cmd+Option+I），查看：
- Console 标签中的日志输出
- Network 标签检查请求是否正常
- 查找红色错误信息

预期的日志顺序：
```
开始初始化数据库...
正在加载数据库...
数据库加载成功
创建待办表...
创建分类表...
创建设置表...
检查默认分类...
分类查询结果: [...]
现有分类数量: 0 或 3
数据库初始化完成
加载分类...
分类加载完成
```

#### 2. 清理并重新安装

```bash
# 清理 node_modules
rm -rf node_modules

# 清理 npm 缓存（如果有权限问题）
sudo chown -R 501:20 "/Users/tx/.npm"

# 重新安装
npm install --legacy-peer-deps

# 清理 Cargo 缓存（可选）
cd src-tauri
cargo clean
cd ..
```

#### 3. 启动应用

```bash
# 启动开发服务器
npm run tauri dev
```

#### 4. 如果仍然白屏

检查是否有端口冲突：
```bash
# 杀掉占用 1420 端口的进程
lsof -ti:1420 | xargs kill -9

# 或者修改 vite.config.ts 中的端口号
```

### 常见错误及解决方案

#### 错误 1: "Port 1420 is already in use"
```bash
lsof -ti:1420 | xargs kill -9
```

#### 错误 2: Database initialization failed
- 检查 Tauri SQL 插件是否正确安装
- 查看控制台的详细错误信息
- 确认 `src-tauri/tauri.conf.json` 中的 SQL 插件配置

#### 错误 3: Permission denied
- 检查 `src-tauri/capabilities/default.json`
- 确保包含 SQL 相关权限

### 手动测试数据库

如果需要手动测试数据库功能，可以在浏览器控制台运行：

```javascript
// 测试数据库加载
import Database from '@tauri-apps/plugin-sql'
const db = await Database.load('sqlite:test.db')
console.log('数据库加载成功:', db)

// 测试创建表
await db.execute('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)')
console.log('表创建成功')

// 测试查询
const result = await db.select('SELECT * FROM test')
console.log('查询结果:', result)
```

### 依赖检查

确保以下包已正确安装：

```json
{
  "@tauri-apps/api": "^2.0.0",
  "@tauri-apps/plugin-sql": "^2.0.0",
  "zustand": "^5.0.0",
  "framer-motion": "^11.0.0"
}
```

### 如果所有方法都失败

1. 删除整个项目
2. 重新克隆/下载
3. 按照 README.md 重新设置

### 联系支持

如果问题持续，请提供：
1. 浏览器控制台完整日志
2. 终端输出信息
3. 操作系统版本
4. Node.js 和 Rust 版本

---

最后更新: 2026-01-07
