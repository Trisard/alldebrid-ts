# @alldebrid/sdk

Modern TypeScript SDK for the AllDebrid API.

## Features

- ✨ **TypeScript-first** - Full type safety with auto-generated types from OpenAPI spec
- 🚀 **Modern** - Built with wretch, ESM + CJS support
- 📦 **Tree-shakeable** - Import only what you need
- 🔄 **Auto-retry** - Built-in retry logic with configurable options
- 🎯 **Type-safe errors** - Typed error classes for better error handling
- 📝 **Fully documented** - JSDoc comments with examples

## Installation

```bash
npm install @alldebrid/sdk
# or
pnpm add @alldebrid/sdk
# or
yarn add @alldebrid/sdk
```

## Quick Start

```typescript
import { AllDebridClient } from '@alldebrid/sdk'

// Create a client
const client = new AllDebridClient({
  apiKey: 'your-api-key-here',
})

// Get user info
const user = await client.user.getInfo()
console.log(user.username, user.isPremium)

// Unlock a link
const result = await client.link.unlock('https://example.com/file.zip')
console.log('Direct link:', result.link)

// Upload a magnet
const magnet = await client.magnet.upload('magnet:?xt=urn:btih:...')
console.log('Magnet ID:', magnet.magnets[0].id)
```

## API Reference

### Client Configuration

```typescript
const client = new AllDebridClient({
  apiKey: string          // Required: Your AllDebrid API key
  agent?: string          // Optional: User agent (default: '@alldebrid/sdk')
  baseUrl?: string        // Optional: API base URL
  timeout?: number        // Optional: Request timeout in ms (default: 30000)
  retry?: boolean         // Optional: Enable auto-retry (default: true)
  maxRetries?: number     // Optional: Max retry attempts (default: 3)
})
```

### User Resource

```typescript
// Get user profile
const user = await client.user.getInfo()

// Get available hosts for user
const hosts = await client.user.getHosts()
const hostsOnly = await client.user.getHosts(true) // Exclude streams/redirectors

// Clear a notification
await client.user.clearNotification('NOTIF_CODE')

// Saved Links Management
const savedLinks = await client.user.getLinks()
await client.user.saveLink('https://example.com/file.zip')
await client.user.deleteLink('saved-link-id')

// History Management
const history = await client.user.getHistory()
await client.user.clearHistory()
```

### Link Resource

```typescript
// Get link information
const info = await client.link.infos('https://example.com/file.zip')
const multipleInfos = await client.link.infos([
  'https://example.com/file1.zip',
  'https://example.com/file2.zip',
])

// Extract from redirector
const links = await client.link.redirector('https://linkprotector.com/abc123')

// Unlock a link
const result = await client.link.unlock('https://example.com/file.zip')

// Get streaming options
const streams = await client.link.streaming('generated-id')

// Check delayed link status
const delayed = await client.link.delayed('delayed-id')
```

### Magnet Resource

```typescript
// Upload magnets
const result = await client.magnet.upload('magnet:?xt=urn:btih:...')
const multiple = await client.magnet.upload(['magnet:?xt=urn:btih:...', 'magnet:?xt=urn:btih:...'])

// Upload torrent file
const file = new File([buffer], 'torrent.torrent')
const uploaded = await client.magnet.uploadFile(file)

// Get magnet status
const status = await client.magnet.status(123)

// Delete a magnet
await client.magnet.delete(123)

// Restart a failed magnet
await client.magnet.restart(123)

// Check instant availability
const available = await client.magnet.instant(['hash1', 'hash2'])

// Watch magnet with polling
await client.magnet.watch(123, {
  interval: 3000, // Poll every 3s
  maxAttempts: 30, // Max 30 attempts
  stopOnStatus: 'Ready', // Stop when ready
  onUpdate: (status) => {
    console.log('Progress:', status.magnets[0]?.status)
  },
})
```

### Host Resource

```typescript
// Get all supported hosts
const hosts = await client.host.list()

// Get only file hosts (exclude streams/redirectors)
const hostsOnly = await client.host.list(true)

// Get all supported domain names
const domains = await client.host.domains()

// Get hosts by priority
const priority = await client.host.priority()
```

## Error Handling

The SDK provides typed error classes for better error handling:

```typescript
import {
  AllDebridError,
  AuthenticationError,
  LinkError,
  MagnetError,
  NetworkError,
} from '@alldebrid/sdk'

try {
  await client.link.unlock(url)
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key')
  } else if (error instanceof LinkError) {
    console.error('Link error:', error.code, error.message)
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.statusCode)
  }
}
```

## Type Safety

All responses are fully typed using types generated from the official AllDebrid OpenAPI specification:

```typescript
import type {
  GetLinkUnlockResponse,
  GetMagnetStatusResponse,
  GetUserResponse,
} from '@alldebrid/sdk'
```

## Development

```bash
# Install dependencies
pnpm install

# Generate types from OpenAPI spec
pnpm generate

# Build
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

## License

MIT

## Links

- [AllDebrid API Documentation](https://docs.alldebrid.com/)
- [GitHub Repository](https://github.com/your-username/alldebrid-ts)
- [NPM Package](https://www.npmjs.com/package/@alldebrid/sdk)
