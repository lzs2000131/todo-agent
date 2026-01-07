use tauri::command;
use tauri::AppHandle;

#[command]
pub async fn send_notification(app: AppHandle, title: String, body: String) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    // 发送系统通知
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("Failed to send notification: {}", e))?;

    Ok(())
}

#[command]
pub async fn request_notification_permission() -> Result<bool, String> {
    // 在macOS上,通知权限会在第一次发送通知时自动请求
    // 这里返回true表示支持通知
    Ok(true)
}
