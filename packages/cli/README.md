# @adbjs/cli

Command-line interface for AllDebrid API v4.1 - manage your torrents, links, and account from the terminal.

## ✨ Features

- 🔥 **Complete API Coverage** - Magnets, links, user management, hosts, and vouchers
- 🎨 **Interactive Mode** - User-friendly prompts with beautiful TUI
- 📊 **Real-time Monitoring** - Watch torrent progress with live updates
- 🔧 **JSON Output** - `--json` flag for shell scripting and automation
- ⚡ **Delta Sync** - Efficient polling with session-based updates
- 🔐 **Secure Auth** - PIN-based authentication with local config storage
- 💻 **Cross-platform** - Works on Windows, macOS, and Linux

## 📦 Installation

```bash
npm install -g @adbjs/cli
```

Or with other package managers:

```bash
pnpm add -g @adbjs/cli
yarn global add @adbjs/cli
```

## 🚀 Quick Start

```bash
# Authenticate with AllDebrid
adb auth login

# Upload a magnet link
adb magnet upload "magnet:?xt=urn:btih:..."

# Check magnet status
adb magnet list

# Get download links
adb magnet files 12345
```

## 🔐 Authentication

The CLI uses PIN-based authentication. Run the login command and follow the instructions:

```bash
adb auth login
```

This will:

1. Generate a PIN code
2. Display a URL to visit
3. Wait for you to authorize the application
4. Save the API key securely

You can also use an environment variable:

```bash
export ALLDEBRID_API_KEY=your-api-key
adb user info
```

Or pass it directly:

```bash
adb --api-key your-api-key user info
```

**Priority order:** CLI flag > Environment variable > Saved config

### Auth Commands

```bash
adb auth login     # Interactive PIN-based login
adb auth logout    # Clear saved credentials
adb auth status    # Check authentication status
```

## 📖 Commands

### Magnet Commands

```bash
# Upload magnet or torrent file
adb magnet upload <magnet-link>
adb magnet upload ./file.torrent

# List all magnets
adb magnet list
adb magnet list --status active    # Filter by status: active, ready, expired, error

# Get status of a specific magnet
adb magnet status <id>

# Monitor all magnets with delta sync (for scripting)
adb magnet status --live
adb magnet status --live --session 123 --counter 5

# Watch magnet progress in real-time
adb magnet watch <id>

# Get download links for completed magnet
adb magnet files <id>

# Delete a magnet
adb magnet delete <id>

# Restart a failed magnet
adb magnet restart <id>

# Interactive mode
adb magnet
```

### Link Commands

```bash
# Unlock a premium link
adb link unlock <url>
adb link unlock <url> --password secret

# Get link information
adb link info <url>

# Get streaming link
adb link stream <id> <quality>

# Extract links from redirector
adb link redirector <url>

# Interactive mode
adb link
```

### User Commands

```bash
# Display account information
adb user info

# List saved links
adb user saved list

# Save a link
adb user saved add <url>

# Delete saved link(s)
adb user saved delete <url>

# View download history
adb user history

# Clear download history
adb user history clear

# Interactive mode
adb user
```

### Host Commands

```bash
# List all supported hosts
adb host list
adb host list --hosts-only    # Only show hosts (no streams/redirectors)

# List all supported domains
adb host domains
```

### Voucher Commands (Reseller)

```bash
# Check voucher balance
adb voucher balance

# List vouchers
adb voucher list
adb voucher list --quantity 10

# Generate vouchers
adb voucher generate <quantity> <days>

# Interactive mode
adb voucher
```

## ⚙️ Global Options

```bash
--api-key <key>    # Override API key
--json             # Output in JSON format (for scripting)
--help             # Show help
--version          # Show version
```

## 🔧 JSON Output

Use the `--json` flag for machine-readable output, perfect for shell scripting:

```bash
# Get magnet list as JSON
adb --json magnet list

# Parse with jq
adb --json magnet status 12345 | jq '.status'

# Use in scripts
STATUS=$(adb --json magnet status 12345 | jq -r '.status')
if [ "$STATUS" = "Ready" ]; then
  echo "Download complete!"
fi
```

JSON mode:

- Outputs raw API responses as formatted JSON
- Disables spinners and colored output
- Skips confirmation prompts (for delete operations)
- Outputs errors as `{"error": "message"}`

## ⚡ Delta Sync for Monitoring

The `--live` flag uses AllDebrid's delta sync API for efficient polling:

```bash
# First call - gets full list
adb --json magnet status --live
# Returns: { "magnets": [...], "session": 123456, "counter": 1, "fullsync": true }

# Subsequent calls - only changed magnets
adb --json magnet status --live --session 123456 --counter 1
# Returns: { "magnets": [...], "counter": 2, "fullsync": false }
```

This is more bandwidth-efficient than polling the full list repeatedly.

## 🎨 Interactive Mode

Run any command group without arguments to enter interactive mode:

```bash
adb magnet    # Interactive magnet management
adb link      # Interactive link management
adb user      # Interactive user management
adb voucher   # Interactive voucher management
adb auth      # Interactive authentication
```

## 🗂️ Configuration

The CLI stores its configuration in:

- **Linux/macOS:** `~/.config/alldebrid/config.json`
- **Windows:** `%APPDATA%\alldebrid\config.json`

## 💡 Examples

### Download a torrent

```bash
# Upload magnet
adb magnet upload "magnet:?xt=urn:btih:..."

# Watch progress
adb magnet watch 12345

# Get download links when ready
adb magnet files 12345
```

### Batch unlock links

```bash
# Using a file with URLs
cat urls.txt | while read url; do
  adb --json link unlock "$url" | jq -r '.link'
done
```

### Monitor all active downloads

```bash
#!/bin/bash
SESSION=""
COUNTER=0

while true; do
  if [ -z "$SESSION" ]; then
    RESULT=$(adb --json magnet status --live)
  else
    RESULT=$(adb --json magnet status --live --session $SESSION --counter $COUNTER)
  fi

  SESSION=$(echo $RESULT | jq -r '.session')
  COUNTER=$(echo $RESULT | jq -r '.counter')

  echo $RESULT | jq '.magnets[] | "\(.id): \(.status)"'

  sleep 5
done
```

## 📋 Requirements

- Node.js >= 20.0.0
- AllDebrid account with API access

## 🔗 Related

- [@adbjs/sdk](https://www.npmjs.com/package/@adbjs/sdk) - TypeScript SDK for AllDebrid API

## 📝 License

MIT
