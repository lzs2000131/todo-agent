// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::screenshot::take_screenshot,
            commands::db::init_db,
            commands::notification::send_notification,
            commands::notification::request_notification_permission,
            commands::shortcut::register_shortcut,
            commands::shortcut::get_current_shortcut
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
