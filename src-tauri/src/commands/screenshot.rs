use tauri::{command, AppHandle, Manager};
use std::process::Command;
use std::env;
use std::fs;
use std::thread;
use std::time::Duration;

#[command]
pub async fn take_screenshot(app: AppHandle) -> Result<Vec<u8>, String> {
    // 获取主窗口
    let window = app.get_webview_window("main");

    // 隐藏窗口以便截图
    if let Some(ref win) = window {
        let _ = win.hide();
        // 等待窗口完全隐藏
        thread::sleep(Duration::from_millis(200));
    }

    // 获取临时文件路径
    let temp_dir = env::temp_dir();
    let screenshot_path = temp_dir.join(format!("todo-agent-screenshot-{}.png", chrono::Utc::now().timestamp()));

    // 使用 macOS screencapture 命令进行交互式区域截图
    // -i: 交互模式(区域选择) - 会显示十字准星光标
    // -x: 静音模式,不播放截图声音
    // -o: 不包含窗口阴影
    let output = Command::new("screencapture")
        .arg("-i")  // 交互式选择区域
        .arg("-x")  // 静音
        .arg("-o")  // 不包含阴影
        .arg(&screenshot_path)
        .output()
        .map_err(|e| format!("Failed to execute screencapture: {}", e))?;

    // 恢复窗口显示
    if let Some(ref win) = window {
        let _ = win.show();
        let _ = win.set_focus();
    }

    if !output.status.success() {
        return Err("Screenshot was cancelled or failed".to_string());
    }

    // 检查文件是否创建成功
    if !screenshot_path.exists() {
        return Err("Screenshot file was not created (user may have cancelled)".to_string());
    }

    // 读取截图文件
    let image_data = fs::read(&screenshot_path)
        .map_err(|e| format!("Failed to read screenshot file: {}", e))?;

    // 删除临时文件
    let _ = fs::remove_file(&screenshot_path);

    Ok(image_data)
}
