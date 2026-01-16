# AllDebrid TypeScript SDK

Modern, type-safe TypeScript SDK for the AllDebrid API v4.1.

## 📦 Packages

This monorepo contains:

- **[@adbjs/sdk](./packages/sdk)** - Core TypeScript SDK for AllDebrid API
- **[@adbjs/cli](./packages/cli)** - Command-line interface for AllDebrid

## 🚀 Quick Start

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

## ✨ Features

- 🎯 **Type-safe** - Full TypeScript support with types generated from OpenAPI spec
- 🚀 **Modern** - Built with latest tooling (wretch, vitest, pnpm)
- 📦 **Tree-shakeable** - ESM + CJS, import only what you need
- 🔄 **Auto-retry** - Built-in retry logic with configurable attempts
- 🎨 **Developer-friendly** - Intuitive API with JSDoc comments
- 🔥 **Complete API v4.1 coverage** - All AllDebrid API v4.1 endpoints implemented and optimized
- ⚡ **Minimal footprint** - Only one runtime dependency (wretch)
- 🛡️ **Typed error handling** - Specific error classes for better error management

## 🏗️ Development

This project uses:

- **pnpm** - Fast, efficient package manager
- **TypeScript** - Strict mode with exactOptionalPropertyTypes
- **tsup** - Fast, zero-config bundler
- **Vitest** - Fast, modern test runner
- **hey-api/openapi-ts** - OpenAPI type generation

### Setup

```bash
# Install dependencies
pnpm install

# Generate types from AllDebrid OpenAPI spec
pnpm --filter @adbjs/sdk generate

# Build all packages
pnpm build

# Run tests
pnpm test
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
└── pnpm-workspace.yaml
```

## 📋 Roadmap

- [ ] Migrate to Bun for faster builds and native executable compilation
- [ ] Standalone executables for Windows, macOS, and Linux (no Node.js required)

## 📝 License

MIT

## 🔗 Links

- [AllDebrid Official Site](https://alldebrid.com)
- [AllDebrid API Documentation](https://docs.alldebrid.com/)
- [OpenAPI Specification](https://docs.alldebrid.com/swagger/alldebrid.json)
