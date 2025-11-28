/**
 * @alldebrid/sdk - Modern TypeScript SDK for AllDebrid API
 *
 * @example
 * ```typescript
 * import { AllDebridClient } from '@alldebrid/sdk'
 *
 * const client = new AllDebridClient({
 *   apiKey: 'your-api-key'
 * })
 *
 * // Get user info
 * const user = await client.user.get()
 *
 * // Unlock a link
 * const result = await client.link.unlock('https://example.com/file.zip')
 *
 * // Upload a magnet
 * const magnet = await client.magnet.upload('magnet:?xt=urn:btih:...')
 * ```
 */

export { AllDebridClient } from './client.js'

// Export errors
export {
  AllDebridError,
  AuthenticationError,
  createTypedError,
  LinkError,
  MagnetError,
  NetworkError,
} from './errors.js'

// Re-export generated types
export type * from './generated/types.gen.js'

export { HostResource } from './resources/host.js'
export { LinkResource } from './resources/link.js'
// Export resource types
export type { PollOptions } from './resources/link.js'
export { MagnetResource } from './resources/magnet.js'

export type { WatchOptions } from './resources/magnet.js'
// Export resources
export { UserResource } from './resources/user.js'

// Export types
export type { AllDebridConfig, ApiError, ApiResponse } from './types.js'
