use keyring::Entry;

const KEYRING_SERVICE: &str = "com.rupak182.heychat";

#[tauri::command]
fn save_api_key(provider: String, api_key: String) -> Result<(), String> {
    if api_key.is_empty() {
        // Delete the entry if the key is cleared
        let entry = Entry::new(KEYRING_SERVICE, &provider).map_err(|e| e.to_string())?;
        match entry.delete_password() {
            Ok(_) | Err(keyring::Error::NoEntry) => Ok(()),
            Err(e) => Err(e.to_string()),
        }
    } else {
        let entry = Entry::new(KEYRING_SERVICE, &provider).map_err(|e| e.to_string())?;
        entry.set_password(&api_key).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn get_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(KEYRING_SERVICE, &provider).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(key) => Ok(key),
        Err(keyring::Error::NoEntry) => Ok(String::new()),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![save_api_key, get_api_key])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
