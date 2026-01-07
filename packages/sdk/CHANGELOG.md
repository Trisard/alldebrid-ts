# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
