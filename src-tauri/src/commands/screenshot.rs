use tauri::command;
use std::process::Command;
use std::env;
use std::fs;

#[command]
pub async fn take_screenshot() -> Result<Vec<u8>, String> {
    // 获取临时文件路径
    let temp_dir = env::temp_dir();
    let screenshot_path = temp_dir.join(format!("todo-agent-screenshot-{}.png", chrono::Utc::now().timestamp()));

    // 使用 macOS screencapture 命令进行交互式区域截图
    // -i: 交互模式(区域选择)
    // -c: 复制到剪贴板
    let output = Command::new("screencapture")
        .arg("-i")
        .arg(&screenshot_path)
        .output()
        .map_err(|e| format!("Failed to execute screencapture: {}", e))?;

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
