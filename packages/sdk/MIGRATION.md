# Migration Guide: v0.x to v1.0

This guide will help you migrate your code from version 0.x to 1.0 of the AllDebrid SDK.

## Breaking Changes

### Magnet Status Methods

The `magnet.status()` method signature has changed to improve API clarity and add new features.

#### Before (0.x)

```typescript
// Get all magnets
const allMagnets = await client.magnet.status()

// Get specific magnet
const magnet = await client.magnet.status(123)
```

#### After (1.0)

```typescript
// Get all magnets - use statusList()
const allMagnets = await client.magnet.statusList()

// Get magnets filtered by status
const activeMagnets = await client.magnet.statusList('active')
const readyMagnets = await client.magnet.statusList('ready')

// Get specific magnet - status() now requires id
const magnet = await client.magnet.status(123)

// NEW: Live mode for efficient polling
const session = Math.floor(Math.random() * 1000000)
let counter = 0
const liveStatus = await client.magnet.statusLive({ session, counter })
```

**Migration Steps:**

1. Replace `magnet.status()` (no arguments) with `magnet.statusList()`
2. Keep `magnet.status(id)` calls as-is

### Quick Migration Checklist

- [ ] Update all `magnet.status()` calls without arguments to `magnet.statusList()`
- [ ] Verify `magnet.status(id)` calls pass a valid ID
- [ ] Consider using `statusLive()` for polling scenarios to reduce bandwidth
- [ ] Update any code that relies on the response structure (should be minimal)

## New Features

### 1. Live Mode for Efficient Polling

If you're polling magnet status regularly, consider using live mode:

```typescript
// Old approach (still works, but uses more bandwidth)
setInterval(async () => {
  const status = await client.magnet.statusList('active')
  console.log('Active magnets:', status.magnets)
}, 3000)

// New approach with live mode (recommended)
const session = Math.floor(Math.random() * 1000000)
let counter = 0

setInterval(async () => {
  const status = await client.magnet.statusLive({ session, counter })
  counter = status.counter // Update counter from response

  // Only changed magnets are returned
  if (status.magnets?.length > 0) {
    console.log('Changed magnets:', status.magnets)
  }
}, 3000)
```

Or use the built-in `watch()` method with live mode:

```typescript
await client.magnet.watch(123, {
  useLiveMode: true,
  interval: 2000,
  onUpdate: (status) => console.log('Update:', status),
})
```

### 2. Batch Operations for User Links

You can now save or delete multiple links at once:

```typescript
// Old approach (still works)
await client.user.saveLink('https://example.com/file1.zip')
await client.user.saveLink('https://example.com/file2.zip')

// New approach (more efficient)
await client.user.saveLink(['https://example.com/file1.zip', 'https://example.com/file2.zip'])

// Same for deletion
await client.user.deleteLink(['id1', 'id2', 'id3'])
```

### 3. Voucher Management (Reseller Accounts)

New resource for reseller voucher management:

```typescript
// Check voucher balance
const balance = await client.voucher.getBalance()
console.log('Balance:', balance.balance, '€')

// Get existing vouchers
const vouchers = await client.voucher.getVouchers(10)
console.log('Voucher codes:', vouchers?.codes)

// Generate new vouchers (30-day validity)
const newVouchers = await client.voucher.generateVouchers(10, 30)
console.log('Generated:', newVouchers?.codes)
```

## Performance Improvements

### Recommendation: Use Live Mode for Monitoring

If your application monitors magnet status frequently:

1. **High-frequency polling** (< 5 seconds): Use `statusLive()` to reduce bandwidth by ~90%
2. **Low-frequency polling** (> 30 seconds): Standard `statusList()` is fine
3. **Single magnet tracking**: Use `watch()` with `useLiveMode: true`

### Example: Real-time Progress Monitor

```typescript
// Before: Full status check every 2 seconds
const intervalId = setInterval(async () => {
  const status = await client.magnet.statusList('active')
  updateUI(status.magnets)
}, 2000)

// After: Delta sync with live mode
const session = Math.floor(Math.random() * 1000000)
let counter = 0

const intervalId = setInterval(async () => {
  const status = await client.magnet.statusLive({ session, counter })
  counter = status.counter

  // Only process if there are changes
  if (status.magnets?.length > 0) {
    updateUI(status.magnets)
  }
}, 2000)
```

## Need Help?

- Check the [README.md](./README.md) for complete examples
- Review the [CHANGELOG.md](./CHANGELOG.md) for all changes
- Open an issue on [GitHub](https://github.com/Trisard/alldebrid-ts/issues) if you need assistance
