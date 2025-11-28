# AllDebrid TypeScript SDK

Modern, type-safe TypeScript SDK for the AllDebrid API.

## 📦 Packages

This monorepo contains:

- **[@alldebrid/sdk](./packages/sdk)** - Core TypeScript SDK for AllDebrid API
- **@alldebrid/cli** - Command-line interface (coming soon)

## 🚀 Quick Start

```bash
npm install @alldebrid/sdk
```

```typescript
import { AllDebridClient, AuthenticationError, LinkError } from '@alldebrid/sdk'

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

See the [@alldebrid/sdk README](./packages/sdk/README.md) for full documentation.

## ✨ Features

- 🎯 **Type-safe** - Full TypeScript support with types generated from OpenAPI spec
- 🚀 **Modern** - Built with latest tooling (wretch, vitest, pnpm)
- 📦 **Tree-shakeable** - ESM + CJS, import only what you need
- 🔄 **Auto-retry** - Built-in retry logic with configurable attempts
- 🎨 **Developer-friendly** - Intuitive API with JSDoc comments
- 🔥 **Complete API coverage** - All AllDebrid API endpoints implemented
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
pnpm --filter @alldebrid/sdk generate

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
│   │   │   ├── resources/   # API resources (user, link, magnet, host)
│   │   │   ├── types.ts     # Core types
│   │   │   ├── errors.ts    # Error classes
│   │   │   └── generated/   # Auto-generated types from OpenAPI
│   │   └── tests/           # Test files
│   └── cli/                 # CLI (coming soon)
└── pnpm-workspace.yaml
```

## 📝 License

MIT

## 🔗 Links

- [AllDebrid Official Site](https://alldebrid.com)
- [AllDebrid API Documentation](https://docs.alldebrid.com/)
- [OpenAPI Specification](https://docs.alldebrid.com/swagger/alldebrid.json)
