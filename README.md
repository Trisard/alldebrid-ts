# AllDebrid TypeScript SDK

Modern, type-safe TypeScript SDK for the AllDebrid API v4.1.

## 📦 Packages

This monorepo contains:

- **[@adbjs/sdk](./packages/sdk)** - Core TypeScript SDK for AllDebrid API
- **[@adbjs/cli](./packages/cli)** - Command-line interface for AllDebrid

## 🚀 Quick Start

### SDK

```bash
npm install @adbjs/sdk
```

```typescript
import { AllDebridClient, AuthenticationError, LinkError } from '@adbjs/sdk'

const client = new AllDebridClient({
  apiKey: 'your-api-key',
})

try {
  // Get user information
  const user = await client.user.getInfo()
  console.log(user.username)

  // Unlock a link
  const unlocked = await client.link.unlock('https://example.com/file.zip')
  console.log(unlocked.link)

  // PIN authentication flow
  const pinData = await client.pin.generate()
  console.log('Visit:', pinData.user_url)
  const apikey = await client.pin.waitForAuth(pinData.check, pinData.pin)
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key:', error.message)
  } else if (error instanceof LinkError) {
    console.error('Link error:', error.message, error.code)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

See the [@adbjs/sdk README](./packages/sdk/README.md) for full documentation.

### CLI

```bash
npm install -g @adbjs/cli
```

```bash
# Authenticate with AllDebrid
adb auth login

# Upload a magnet link
adb magnet upload "magnet:?xt=urn:btih:..."

# Watch download progress
adb magnet watch 12345

# Unlock a premium link
adb link unlock "https://example.com/file.zip"

# Get account info
adb user info
```

See the [@adbjs/cli README](./packages/cli/README.md) for full documentation.

## ✨ Features

### SDK

- 🎯 **Type-safe** - Full TypeScript support with types generated from OpenAPI spec
- 🚀 **Modern** - Built with Bun and wretch
- 📦 **Tree-shakeable** - ESM + CJS, import only what you need
- 🔄 **Auto-retry** - Built-in retry logic with configurable attempts
- 🎨 **Developer-friendly** - Intuitive API with JSDoc comments
- 🔥 **Complete API v4.1 coverage** - All AllDebrid API v4.1 endpoints implemented and optimized
- ⚡ **Minimal footprint** - Only one runtime dependency (wretch)
- 🛡️ **Typed error handling** - Specific error classes for better error management

### CLI

- 🔥 **Complete API Coverage** - Magnets, links, user management, hosts, and vouchers
- 🎨 **Interactive Mode** - User-friendly prompts with beautiful TUI
- 📊 **Real-time Monitoring** - Watch torrent progress with live updates
- 🔧 **JSON Output** - `--json` flag for shell scripting and automation
- ⚡ **Delta Sync** - Efficient polling with session-based updates
- 🔐 **Secure Auth** - PIN-based authentication with local config storage
- 💻 **Cross-platform** - Works on Windows, macOS, and Linux

## 🏗️ Development

This project uses:

- **Bun** - Fast all-in-one JavaScript runtime
- **TypeScript** - Strict mode with exactOptionalPropertyTypes
- **dts-bundle-generator** - TypeScript declaration bundler
- **hey-api/openapi-ts** - OpenAPI type generation

### Setup

```bash
# Install dependencies
bun install

# Generate types from AllDebrid OpenAPI spec
bun run generate

# Build all packages
bun run build

# Run tests
bun test
```

### Project Structure

```
alldebrid-ts/
├── packages/
│   ├── sdk/                 # Core TypeScript SDK
│   │   ├── src/
│   │   │   ├── client.ts    # Main client class
│   │   │   ├── resources/   # API resources (user, link, magnet, host, pin, voucher)
│   │   │   ├── types.ts     # Core types
│   │   │   ├── errors.ts    # Error classes
│   │   │   └── generated/   # Auto-generated types from OpenAPI
│   │   └── tests/           # Test files
│   └── cli/                 # Command-line interface
```

## 📝 License

MIT

## 🔗 Links

- [AllDebrid Official Site](https://alldebrid.com)
- [AllDebrid API Documentation](https://docs.alldebrid.com/)
- [OpenAPI Specification](https://docs.alldebrid.com/swagger/alldebrid.json)
