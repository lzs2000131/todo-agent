use tauri::{command, AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState, Shortcut};
use std::sync::Mutex;

// 存储当前注册的快捷键
static CURRENT_SHORTCUT: Mutex<Option<String>> = Mutex::new(None);

// 将字符串转换为 Shortcut
fn parse_shortcut(s: &str) -> Result<Shortcut, String> {
    // Tauri 2.x 的快捷键格式处理
    // 输入: CmdOrCtrl+Shift+E -> 输出: Cmd+Shift+KeyE
    let s = if s.contains("CmdOrCtrl") {
        s.replace("CmdOrCtrl", "Cmd")
    } else {
        s.to_string()
    };

    // 检查最后部分是否是单字母,如果是则添加 Key 前缀
    let parts: Vec<&str> = s.split('+').collect();
    let formatted = if parts.len() >= 2 {
        let last = parts.last().unwrap();
        if last.len() == 1 && !last.starts_with("Key") {
            // 单字母,添加 Key 前缀 (如 KeyE, KeyT)
            format!("{}+Key{}", parts[..parts.len()-1].join("+"), last.to_uppercase())
        } else {
            s.to_string()
        }
    } else {
        s.to_string()
    };

    Shortcut::try_from(formatted.as_str()).map_err(|e| format!("无效的快捷键 '{}': {}", formatted, e))
}

#[command]
pub async fn register_shortcut(app: AppHandle, shortcut: String) -> Result<bool, String> {
    // 解除旧的快捷键
    let old_shortcut = CURRENT_SHORTCUT.lock().unwrap().clone();
    if let Some(ref old) = old_shortcut {
        if let Ok(sc) = parse_shortcut(old) {
            let _ = app.global_shortcut().unregister(sc);
        }
    }

    // 解析新快捷键
    let sc = parse_shortcut(&shortcut)?;

    // 克隆 app handle 用于事件回调
    let handle = app.app_handle().clone();

    // 使用带回调的 register 方法一次性注册快捷键和事件处理器
    match app.global_shortcut().on_shortcut(sc, move |_app, _shortcut, event| {
        if event.state == ShortcutState::Pressed {
            println!("快捷键触发: {:?}", _shortcut);
            // 使用 emit_all 发送给所有窗口，确保事件能被接收
            if let Err(e) = handle.emit("trigger-screenshot", ()) {
                eprintln!("发送事件失败: {}", e);
            } else {
                println!("trigger-screenshot 事件已发送");
            }
        }
    }) {
        Ok(_) => {
            // 保存当前快捷键
            *CURRENT_SHORTCUT.lock().unwrap() = Some(shortcut.clone());
            println!("快捷键注册成功: {}", shortcut);
            Ok(true)
        }
        Err(e) => {
            // 注册失败,尝试恢复旧的快捷键
            if let Some(ref old) = old_shortcut {
                if let Ok(old_sc) = parse_shortcut(old) {
                    let handle = app.app_handle().clone();
                    let _ = app.global_shortcut().on_shortcut(old_sc, move |_app, _shortcut, event| {
                        if event.state == ShortcutState::Pressed {
                            let _ = handle.emit("trigger-screenshot", ());
                        }
                    });
                    *CURRENT_SHORTCUT.lock().unwrap() = Some(old.clone());
                }
            }
            Err(format!("快捷键格式无效或已被占用: {}", e))
        }
    }
}

#[command]
pub async fn get_current_shortcut() -> Option<String> {
    CURRENT_SHORTCUT.lock().unwrap().clone()
}
