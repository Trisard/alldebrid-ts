# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-16

### @adbjs/sdk v2.0.1

#### Fixed

- Default user agent changed from `@alldebrid/sdk` to `@adbjs/sdk`
- Documentation fixes for `statusLive()` and `watch()` methods

### @adbjs/cli v1.0.0

#### Added

- Complete CLI for AllDebrid API v4.1
- Commands: `magnet`, `link`, `user`, `host`, `voucher`, `auth`
- Interactive mode with beautiful TUI (@clack/prompts)
- JSON output mode (`--json`) for shell scripting
- Delta sync support for efficient monitoring (`--live`)
- Real-time magnet progress watching (`adb magnet watch`)
- PIN-based authentication (`adb auth login`)
- Cross-platform configuration storage

#### Commands

- `adb magnet` - Upload, list, watch, delete magnets
- `adb link` - Unlock links, get info, streaming
- `adb user` - Account info, saved links, history
- `adb host` - List supported hosts and domains
- `adb voucher` - Reseller voucher management
- `adb auth` - Login, logout, status
