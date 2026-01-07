use tauri::command;

#[command]
pub async fn init_db() -> Result<String, String> {
    // 数据库初始化逻辑将在 Phase 2 实现
    Ok("Database initialized".to_string())
}
