# @adbjs/sdk

Modern TypeScript SDK for the AllDebrid API v4.1.

## ✨ Features

- 🎯 **TypeScript-first** - Full type safety with auto-generated types from OpenAPI v4.1 spec
- 🚀 **Modern** - Built with wretch, ESM + CJS support
- 📦 **Tree-shakeable** - Import only what you need
- 🔄 **Auto-retry** - Built-in retry logic with configurable options
- 🛡️ **Type-safe errors** - Typed error classes for better error handling
- 📝 **Fully documented** - JSDoc comments with examples
- ⚡ **API v4.1 optimized** - Designed and optimized for AllDebrid API v4.1
- 💡 **Minimal footprint** - Only one runtime dependency (wretch)

## 📦 Installation

```bash
npm install @adbjs/sdk
# or
bun add @adbjs/sdk
# or
pnpm add @adbjs/sdk
# or
yarn add @adbjs/sdk
```

## 🚀 Quick Start

```typescript
import { AllDebridClient } from '@adbjs/sdk'

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

## 📖 API Reference

### Client Configuration

```typescript
const client = new AllDebridClient({
  apiKey: string          // Required: Your AllDebrid API key
  agent?: string          // Optional: User agent (default: '@adbjs/sdk')
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

// Save single link
await client.user.saveLink('https://example.com/file.zip')

// Save multiple links at once (batch operation)
await client.user.saveLink(['https://example.com/file1.zip', 'https://example.com/file2.zip'])

// Delete single link
await client.user.deleteLink('saved-link-id')

// Delete multiple links at once (batch operation)
await client.user.deleteLink(['id1', 'id2', 'id3'])

// History Management
const history = await client.user.getHistory()
await client.user.clearHistory()

// Email Verification
const status = await client.user.getVerificationStatus('token')
await client.user.resendVerification('token')
```

### Link Resource

```typescript
// Get link information
const info = await client.link.infos('https://example.com/file.zip')
const multipleInfos = await client.link.infos([
  'https://example.com/file1.zip',
  'https://example.com/file2.zip',
])

// Get link information with password
const protectedInfo = await client.link.infos('https://example.com/file.zip', 'password123')

// Extract from redirector
const links = await client.link.redirector('https://linkprotector.com/abc123')

// Unlock a link
const result = await client.link.unlock('https://example.com/file.zip')

// Unlock a password-protected link
const protectedResult = await client.link.unlock('https://example.com/file.zip', 'password123')

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

// ===== Standard Mode: Get magnet status =====

// Get status of a specific magnet by ID
const status = await client.magnet.status(123)
console.log('Magnet status:', status.magnets[0]?.status)

// Get list of all magnets
const allMagnets = await client.magnet.statusList()

// Get list of magnets filtered by status
const activeMagnets = await client.magnet.statusList('active') // Downloading
const readyMagnets = await client.magnet.statusList('ready') // Completed
const expiredMagnets = await client.magnet.statusList('expired') // Expired
const errorMagnets = await client.magnet.statusList('error') // Failed

// ===== Live Mode: Efficient polling with delta sync =====
// Live mode only returns magnets that changed since the last request,
// significantly reducing bandwidth usage. Perfect for real-time monitoring.

// Initialize live mode with a random session ID
const session = Math.floor(Math.random() * 1000000)
let counter = 0

// First call: Returns all magnets (full sync)
const firstCall = await client.magnet.statusLive({ session, counter })
console.log('Full sync:', firstCall.magnets)

// Update counter from response
counter = firstCall.counter // Important: Use the returned counter value

// Subsequent calls: Only returns changed magnets (delta sync)
const secondCall = await client.magnet.statusLive({ session, counter })
console.log('Delta sync (only changes):', secondCall.magnets)

// Update counter for subsequent calls
counter = secondCall.counter

// ===== Magnet management =====

// Delete a magnet
await client.magnet.delete(123)

// Restart a failed magnet
await client.magnet.restart(123)

// Get download links for a completed magnet
const files = await client.magnet.files(123)
files?.forEach((file) => {
  console.log(file.filename, file.link)
})

// ===== Watch: Monitor magnet progress with automatic polling =====

// Watch a magnet until it's ready
await client.magnet.watch(123, {
  interval: 3000, // Check every 3 seconds
  maxAttempts: 30, // Stop after 30 attempts (0 = infinite)
  stopOnStatus: 'Ready', // Stop when magnet is ready
  onUpdate: (status) => {
    const magnet = status.magnets[0]
    console.log(`Progress: ${magnet?.status} - ${magnet?.downloaded || 0}%`)
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

### Pin Resource

```typescript
// Generate a PIN for authentication
const pinData = await client.pin.generate()
console.log('Visit:', pinData.user_url)
console.log('PIN:', pinData.pin)

// Check PIN status manually
const result = await client.pin.check(pinData.check, pinData.pin)
if (result?.activated && result?.apikey) {
  console.log('Authorized! API Key:', result.apikey)
}

// Wait for authorization with automatic polling
const apikey = await client.pin.waitForAuth(pinData.check, pinData.pin, {
  timeout: 600000, // 10 minutes
  interval: 3000, // Check every 3 seconds
})
```

### Voucher Resource

```typescript
// Get reseller voucher balance
const balance = await client.voucher.getBalance()
console.log('Remaining balance:', balance.balance, '€')

// Retrieve existing vouchers from inventory
const allVouchers = await client.voucher.getVouchers()
console.log('Vouchers:', allVouchers?.codes)

// Retrieve specific quantity of vouchers
const fiveVouchers = await client.voucher.getVouchers(5)

// Generate new vouchers (deducts from balance)
// Generate 10 vouchers valid for 30 days
const newVouchers = await client.voucher.generateVouchers(10, 30)
console.log('Generated vouchers:', newVouchers?.codes)
```

## 🛡️ Error Handling

The SDK provides typed error classes for better error handling:

```typescript
import {
  AllDebridError,
  AuthenticationError,
  LinkError,
  MagnetError,
  NetworkError,
} from '@adbjs/sdk'

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

## 🎯 Type Safety

All responses are fully typed using types generated from the official AllDebrid API v4.1 OpenAPI specification:

```typescript
import type { GetLinkUnlockResponse, GetMagnetStatusResponse, GetUserResponse } from '@adbjs/sdk'
```

## 🏗️ Development

```bash
# Install dependencies
bun install

# Generate types from OpenAPI spec
bun run generate

# Build
bun run build

# Run tests
bun test

# Type check
bun run typecheck
```

## 📝 License

MIT

## 🔗 Related

- [@adbjs/cli](https://www.npmjs.com/package/@adbjs/cli) - Command-line interface for AllDebrid
- [AllDebrid API Documentation](https://docs.alldebrid.com/)
- [GitHub Repository](https://github.com/Trisard/alldebrid-ts)
