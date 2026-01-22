# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-01-19

### Changed

- **Build system migration**: Migrated from tsup to Bun
  - `bun build` for ESM and CJS bundles
  - `dts-bundle-generator` for TypeScript declaration bundling
  - `bun test` for running tests

### Documentation

- Updated README with Bun installation and development commands
- Added `bun add @adbjs/sdk` to installation options

## [2.0.2] - 2025-01-16

### Fixed

- README updates with CLI references

## [2.0.1] - 2025-01-16

### Fixed

- Default user agent changed from `@alldebrid/sdk` to `@adbjs/sdk`
- Documentation fixes for `statusLive()` and `watch()` methods

## [2.0.0] - 2025-01-08

### Breaking Changes

#### Response Normalization

All SDK methods now consistently return `data` objects instead of extracting nested fields. This provides better access to metadata and maintains consistency across all endpoints.

**Affected Methods:**

- **`magnet.files()`**: Now returns `{ magnets: [...] }` instead of just the array
  - **Before**: `const files = await client.magnet.files(123); files.forEach(...)`
  - **After**: `const data = await client.magnet.files(123); data.magnets.forEach(...)`

- **`link.infos()`**: Now returns `{ infos: [...] }` instead of just the array
  - **Before**: `const infos = await client.link.infos('url'); infos.forEach(...)`
  - **After**: `const data = await client.link.infos('url'); data.infos.forEach(...)`

- **`link.redirector()`**: Now returns `{ links: [...] }` instead of just the array
  - **Before**: `const links = await client.link.redirector('url'); links.forEach(...)`
  - **After**: `const data = await client.link.redirector('url'); data.links.forEach(...)`

- **`user.getInfo()`**: Now returns `{ user: {...} }` instead of just the user object
  - **Before**: `const user = await client.user.getInfo(); console.log(user.username)`
  - **After**: `const data = await client.user.getInfo(); console.log(data.user.username)`

#### Watch Method Simplification

- **`magnet.watch()`**: Removed `useLiveMode` option to simplify the API
  - **Before**: `await client.magnet.watch(id, { useLiveMode: true })`
  - **After**: Use `client.magnet.statusLive()` directly for live mode functionality
  - **Migration**: For simple single-magnet watching, use `watch()` without options. For advanced multi-magnet monitoring with bandwidth optimization, use `statusLive()` directly (see documentation for examples).

### Added

- **Enhanced `statusLive()` Documentation**: Comprehensive guide on using live mode for efficient multi-magnet monitoring
  - Detailed explanation of delta synchronization mechanism
  - Complete example showing how to track multiple magnets with minimal bandwidth
  - Clear warnings about the deprecated `id` parameter
  - When to use live mode vs simple `watch()`

### Improved

- **Consistent API Design**: All methods now follow the same pattern of returning the complete `data` object
- **Better Metadata Access**: Users can now access response metadata (like `counter` in live mode) without special handling
- **Clearer Method Purpose**: `watch()` is now purely for simple single-magnet polling, while `statusLive()` is explicitly for advanced multi-magnet scenarios

## [1.0.0] - 2026-01-07

### Added

#### Magnet Resource

- **Live Mode Support**: New `statusLive()` method for efficient polling with delta sync
  - Reduces bandwidth by only returning changed magnets
  - Uses session/counter pattern for tracking changes
  - Perfect for real-time monitoring applications
- **Split Status Methods**: Three distinct methods for different use cases
  - `status(id)`: Get status of a specific magnet by ID
  - `statusList(statusFilter?)`: Get all magnets or filter by status (active/ready/expired/error)
  - `statusLive(options, id?)`: Delta sync mode for efficient polling
- **Watch Live Mode**: `watch()` now supports `useLiveMode` option for bandwidth-efficient monitoring

#### Voucher Resource

- Complete voucher management for reseller accounts
  - `getBalance()`: Check remaining voucher balance
  - `getVouchers(quantity?)`: Retrieve existing vouchers from inventory
  - `generateVouchers(quantity, duration)`: Generate new vouchers (deducts from balance)
- Full TypeScript support with auto-generated types from OpenAPI spec

#### User Resource

- **Batch Operations**: `saveLink()` and `deleteLink()` now support arrays
  - Save multiple links at once: `saveLink(['url1', 'url2'])`
  - Delete multiple links at once: `deleteLink(['id1', 'id2'])`
  - Uses FormData with `links[]` notation for proper array handling

#### Documentation

- Complete OpenAPI specification with 8 categories and 30 documented endpoints
- All endpoints now include detailed descriptions
- Parameter-level documentation with mode indicators (Standard/Live)
- Enhanced README with comprehensive live mode examples

### Changed

#### Breaking Changes

- **Magnet.status()**: Now requires `id` parameter (previously optional)
  - **Before**: `magnet.status()` or `magnet.status(id)`
  - **After**: `magnet.status(id)` for specific magnet, `magnet.statusList()` for all magnets
  - **Migration**: Replace `magnet.status()` with `magnet.statusList()`

#### Improvements

- Type generation simplified - no longer copies OpenAPI spec file
- OpenAPI spec services generation disabled (types only)
- Better error messages and type safety throughout

### Fixed

- API inconsistency: `magnet.status(id)` now properly normalizes single magnet responses into array format

## [0.2.0] - Previous Release

Initial implementation with core functionality.

[1.0.0]: https://github.com/Trisard/alldebrid-ts/releases/tag/v1.0.0
