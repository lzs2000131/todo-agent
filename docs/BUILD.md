# Todo Agent - 构建和打包指南

## 应用图标

### 图标设计要求

应用需要以下图标文件:

- `icons/32x32.png` - 32x32像素 PNG
- `icons/128x128.png` - 128x128像素 PNG
- `icons/128x128@2x.png` - 256x256像素 PNG (Retina)
- `icons/icon.icns` - macOS图标文件
- `icons/icon.ico` - Windows图标文件

### 生成图标

1. **准备源图标**
   - 创建一个1024x1024的高质量PNG图标
   - 建议使用清新活泼的设计风格,与应用UI配色一致
   - 可以使用图标生成工具如 [IconKitchen](https://icon.kitchen/)

2. **使用Tauri图标生成器**

```bash
# 安装Tauri CLI (如果还没安装)
cargo install tauri-cli

# 生成所有需要的图标格式
# 将1024x1024的icon.png放在项目根目录
cargo tauri icon path/to/icon.png
```

这会自动生成所有需要的图标格式到 `src-tauri/icons/` 目录。

## 构建应用

### 开发模式

```bash
# 启动开发服务器
npm run tauri dev

# 或使用快速启动脚本
./start.sh
```

### 生产构建

```bash
# 构建应用
npm run tauri build
```

构建完成后,可执行文件位于:
- macOS: `src-tauri/target/release/bundle/dmg/`
- Windows: `src-tauri/target/release/bundle/msi/`

## DMG打包配置

DMG打包配置已在 `tauri.conf.json` 中设置:

```json
{
  "bundle": {
    "macOS": {
      "dmg": {
        "appPosition": { "x": 180, "y": 170 },
        "applicationFolderPosition": { "x": 480, "y": 170 },
        "windowSize": { "width": 660, "height": 400 }
      }
    }
  }
}
```

## 自动更新配置

### 1. 生成更新密钥对

```bash
# 生成公私钥对
cargo tauri signer generate

# 输出示例:
# Public key: dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDFDMUI5MUFEQUM5QzE1RjU=
# Private key: (保存到安全位置)
```

### 2. 配置公钥

将公钥添加到 `tauri.conf.json`:

```json
{
  "plugins": {
    "updater": {
      "active": true,
      "pubkey": "你的公钥"
    }
  }
}
```

### 3. 发布新版本

1. 更新 `tauri.conf.json` 中的版本号
2. 构建应用: `npm run tauri build`
3. 签名更新文件:

```bash
# 使用私钥签名
cargo tauri signer sign path/to/app.tar.gz -k /path/to/private.key
```

4. 创建 `latest.json` 文件:

```json
{
  "version": "1.0.0",
  "notes": "更新内容说明",
  "pub_date": "2026-01-07T10:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "signature": "签名内容",
      "url": "https://github.com/username/todo-agent/releases/download/v1.0.0/app.tar.gz"
    }
  }
}
```

5. 将 `latest.json` 和应用文件上传到GitHub Releases

## 发布清单

- [ ] 更新版本号 (`tauri.conf.json` 和 `package.json`)
- [ ] 生成应用图标
- [ ] 运行测试确保功能正常
- [ ] 构建生产版本
- [ ] 签名应用和更新文件
- [ ] 创建GitHub Release
- [ ] 上传DMG文件和latest.json
- [ ] 更新README文档

## 常见问题

### 构建失败

1. **确保Rust工具链已安装**:
   ```bash
   rustc --version
   cargo --version
   ```

2. **清理构建缓存**:
   ```bash
   cargo clean
   npm run tauri build
   ```

### 图标显示异常

确保图标文件格式正确,尺寸准确。可以使用 `cargo tauri icon` 重新生成。

### 自动更新不工作

1. 检查公钥配置是否正确
2. 确认latest.json格式正确且可访问
3. 查看应用日志中的更新检查信息

## 资源链接

- [Tauri文档](https://tauri.app)
- [Tauri图标指南](https://tauri.app/v1/guides/features/icons)
- [Tauri更新器](https://tauri.app/v1/guides/distribution/updater)
