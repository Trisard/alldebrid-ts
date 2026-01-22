# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-19

### Added

- **Standalone executables**: Pre-built binaries for all major platforms
  - Windows x64 (`adb-windows-x64.exe`)
  - Linux x64 (`adb-linux-x64`)
  - Linux ARM64 (`adb-linux-arm64`)
  - macOS x64 (`adb-darwin-x64`)
  - macOS ARM64 / Apple Silicon (`adb-darwin-arm64`)
  - No Node.js installation required
  - Available on [GitHub Releases](https://github.com/Trisard/alldebrid-ts/releases)

### Changed

- **Build system migration**: Migrated from tsup to Bun
  - `bun build` for JavaScript bundling
  - `bun build --compile` for standalone executables

### Documentation

- Updated README with standalone executable installation instructions
- Added platform-specific download table
- Updated requirements section to mention standalone option

## [1.0.1] - 2025-01-16

### Fixed

- Fixed `workspace:*` dependency replaced with `^2.0.2` for npm compatibility

## [1.0.0] - 2025-01-14

### Added

Initial release of AllDebrid CLI tool with complete feature set:

#### Authentication

- `adb auth login`: Interactive PIN-based authentication flow
- `adb auth logout`: Clear stored credentials
- Secure credential storage using system keychain

#### Magnet Commands

- `adb magnet upload <magnet>`: Upload magnet links or torrent files
- `adb magnet list`: List all magnets with filtering options
- `adb magnet status <id>`: Get detailed status of a specific magnet
- `adb magnet watch <id>`: Real-time progress monitoring
- `adb magnet files <id>`: Get download links for completed magnets
- `adb magnet delete <id>`: Delete a magnet
- `adb magnet restart <id>`: Restart failed magnets
- Interactive mode: `adb magnet` for guided operations

#### Link Commands

- `adb link unlock <url>`: Unlock premium download links
- `adb link info <url>`: Get information about links
- `adb link redirector <url>`: Extract links from redirectors

#### User Commands

- `adb user info`: Display user account information
- `adb user hosts`: List available premium hosts

#### Host & Voucher Commands

- `adb host list`: List all supported hosts
- `adb voucher balance`: Check voucher balance (reseller accounts)

#### Scripting Support

- `--json` global flag for machine-readable JSON output
- `adb magnet status --live`: Delta sync for efficient multi-magnet monitoring
  - `--session` and `--counter` options for stateful polling

### Features

- **Interactive Mode**: User-friendly prompts for all operations
- **Progress Indicators**: Spinners and progress bars for long-running operations
- **Colored Output**: Syntax highlighting and status colors for better readability
- **Error Handling**: Clear error messages with actionable feedback
- **JSON Output**: `--json` flag for shell scripting and automation

### Fixed

- **Progress Display**: Fixed aberrant progress percentages (e.g., "1041304849%") in `magnet watch` and `magnet status` commands
  - Progress is now correctly calculated from bytes: `(downloaded / size) * 100`
  - Display shows both percentage and human-readable sizes: "67% (1.00 GB / 1.46 GB)"
- **Status Display**: Fixed "undefined" status in watch command with proper fallback chain
- **Ready Torrents**: Fixed 0% progress display for already-completed torrents - now shows 100%
- **Watch Command**: Fixed callback data structure handling to work correctly

### Internal

- Updated to use @adbjs/sdk v2.0.0 with normalized response handling
- All commands now properly access data through the SDK's response structure

[1.0.0]: https://github.com/Trisard/alldebrid-ts/releases/tag/v1.0.0
