// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        // Force GDK to run on X11/XWayland to avoid Wayland display dispatch crashes
        std::env::set_var("GDK_BACKEND", "x11");
        // Disable DMA-BUF renderer in WebKitGTK to prevent freezes and GPU rendering incompatibilities
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    heychat_lib::run()
}
