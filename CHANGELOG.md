# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-01-19

### Changed

- **Build system migration**: Migrated from pnpm/tsup/vitest to Bun
  - 5-10x faster builds
  - Unified toolchain (single runtime for build, test, and execution)
  - Uses `dts-bundle-generator` for TypeScript declaration bundling

### Added

- **Standalone CLI executables**: Cross-platform binaries available on GitHub Releases
  - Windows x64, Linux x64/ARM64, macOS x64/ARM64
  - No Node.js required to run the CLI

### @adbjs/sdk v2.1.0

- Build system migrated to Bun
- Documentation updated for Bun workflow

### @adbjs/cli v1.1.0

- Build system migrated to Bun
- Added standalone executable builds
- Documentation updated with binary download instructions

## [1.2.2] - 2025-01-16

### @adbjs/cli v1.0.1

#### Fixed

- Fixed `workspace:*` dependency replaced with `^2.0.2` for npm compatibility
