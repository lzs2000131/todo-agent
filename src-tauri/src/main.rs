// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::screenshot::take_screenshot,
            commands::db::init_db,
            commands::notification::send_notification,
            commands::notification::request_notification_permission,
            commands::shortcut::register_shortcut,
            commands::shortcut::get_current_shortcut,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
