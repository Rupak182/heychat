# HeyChat 💬

HeyChat is a lightweight, local-first AI chat client built with **Tauri v2**, **React**, and **TypeScript**. It offers secure credential storage, local SQLite history persistence, and robust integrations with multiple cloud and local AI models.

---

## ✨ Features

- **Multi-Engine AI Chat**: Seamless conversation experience with real-time response streaming. Toggle between Google Gemini, OpenAI, Groq, Anthropic, Ollama (local), or any custom OpenAI-compatible endpoint.
- **Secure Keyring Protection**: Your API keys are saved directly into your system's native keychain rather than in plain text configuration files.
- **Local History & Thread Management**: Keep your conversations organized. Create, switch between, and delete chat threads locally. All data is saved on your device in an SQLite database.
- **Advanced Model Settings**: Easily customize Model IDs and Base URLs for Ollama or custom API gateways to use any open-source or proprietary models.
- **Always-on-Top Window**: Keep your chat window floating above other applications to easily query AI models while coding or browsing.
- **Rich Markdown Formatting**: Fully formatted responses including tables, bulleted lists, links, and code blocks.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Lucide Icons, Shadcn components.
- **Backend (Tauri v2)**: Rust, `keyring` crate (OS Keychain integration), Tauri HTTP plugin (bypassing CORS limits).
- **AI SDK**: Vercel AI SDK (`ai`), `@ai-sdk/openai-compatible` (hardened custom endpoints), `@ai-sdk/react`.
- **Database**: SQLite (local persistence).

---

## 🚀 Getting Started

### System Dependencies

#### 👤 For End-Users (Running the App)
To run the pre-compiled release application (e.g., `.deb`, `AppImage`, `.dmg`, or `.exe` installer), the system requirements are:

* **🐧 Linux (Debian/Ubuntu)**:
  - **WebKitGTK Runtime**: Pre-installed on standard Ubuntu/GNOME; automatically resolved if installing via the `.deb` package.
  - **A Keyring Manager** (e.g., `gnome-keyring`): Usually already installed and running by default on GNOME/KDE.
* **🍏 macOS**:
  - **No dependencies required**! macOS includes the native WebKit engine (Safari) and Keychain Access out-of-the-box.
* **🪟 Windows**:
  - **WebView2 Runtime**: Pre-installed by default on Windows 11 and updated Windows 10 systems.
  - **Windows Credential Manager**: Built-in and active out-of-the-box.

#### 💻 For Developers (Building from Source)
To compile the application yourself, you will need **Rust & Cargo**, **Bun** (or Node.js), and your operating system's build environment:

* **🐧 Linux (Debian/Ubuntu)**:
  - Run the following command to install the required compilers and headers:
    ```bash
    sudo apt install build-essential curl wget file libssl-dev libgtk-3-dev libwebkit2gtk-4.1-dev libdbus-1-dev pkg-config
    ```
* **🍏 macOS**:
  - Run the following command to install Apple's Command Line Developer Tools:
    ```bash
    xcode-select --install
    ```
* **🪟 Windows**:
  - Download and install the [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) and select the **"Desktop development with C++"** workload to install the MSVC compilers.

### Download & Installation

#### 📦 Download Pre-Compiled Installers
If you just want to run the application, head over to the **[Releases](https://github.com/Rupak182/heycast/releases)** page and download the installer for your operating system:
* **Linux**: Download the `.deb` (for Ubuntu/Debian) or `.AppImage` (portable)
* **macOS**: Download the `.dmg` installer
* **Windows**: Download the `.msi` installer

#### 💻 Build from Source (For Developers)

1. Clone the repository:
   ```bash
   git clone https://github.com/Rupak182/heycast.git
   cd heycast
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

### Running in Development

To launch the hot-reloading development environment:
```bash
bun run tauri dev
```

### Building Production Bundles

To build the optimized production executable and installers (`.deb`, `.rpm`, `.AppImage` on Linux):
```bash
bun run tauri build
```
The finished installers will be located at `src-tauri/target/release/bundle/`.

---

## 📂 Project Structure

```
├── src/                      # React Frontend
│   ├── components/           # UI and Layout Components
│   ├── db/                   # Local database queries & SQLite client
│   ├── hooks/                # Custom React Hooks (AI streaming pipeline & state)
│   ├── lib/                  # Configurations, wrappers, and utilities
│   └── screens/              # Core Application Screens (Home, Settings)
├── src-tauri/                # Tauri Rust Backend
│   ├── src/
│   │   ├── lib.rs            # Rust commands (Keyring integration, window setup)
│   │   └── main.rs           # Entry point
│   ├── icons/                # Multi-platform App Icons
│   └── tauri.conf.json       # App configuration (always-on-top, windows size, bundles)
```

---

## 🔒 Security

All API keys are securely delegated to the host operating system's native keychain. HeyChat itself does not track, store, or transmit your API credentials to any third-party databases.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
