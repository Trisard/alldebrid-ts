import type {
  GetDelayedStatusResponse,
  GetLinkInfosResponse,
  GetRedirectorLinksResponse,
  GetStreamingLinkResponse,
  UnlockLinkResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * Options for polling delayed link generation
 */
export interface PollOptions {
  /**
   * Polling interval in milliseconds
   * @default 2000
   */
  interval?: number

  /**
   * Maximum number of polling attempts
   * @default 30
   */
  maxAttempts?: number

  /**
   * Callback called on each polling attempt
   */
  onPoll?: (attempt: number) => void
}

/**
 * Link resource for unlocking and managing download links
 */
export class LinkResource extends BaseResource {
  /**
   * Get information about one or more links
   *
   * @param links - Single link or array of links to get info for
   * @param password - Optional password for password-protected links
   *
   * @example
   * ```ts
   * const data = await client.link.infos('https://example.com/file.zip')
   * console.log(data.infos)
   *
   * // With password
   * const protectedData = await client.link.infos(
   *   'https://example.com/protected.zip',
   *   'mypassword'
   * )
   * ```
   */
  async infos(links: string | string[], password?: string) {
    const linksArray = Array.isArray(links) ? links : [links]
    const params = password ? { password } : undefined
    return this.post<GetLinkInfosResponse>('/link/infos', { 'link[]': linksArray }, params)
  }

  /**
   * Extract links from redirectors/link protectors
   *
   * @param link - The redirector link to extract from
   *
   * @example
   * ```ts
   * const data = await client.link.redirector('https://linkprotector.com/abc123')
   * console.log(data.links)
   * ```
   */
  async redirector(link: string) {
    return this.post<GetRedirectorLinksResponse>('/link/redirector', {
      link,
    })
  }

  /**
   * Unlock a download link
   *
   * @param link - The link to unlock
   * @param password - Optional password for password-protected links
   *
   * @example
   * ```ts
   * const result = await client.link.unlock('https://example.com/file.zip')
   * if (result.link) {
   *   console.log('Direct link:', result.link)
   * } else if (result.delayed) {
   *   // Handle delayed generation
   *   const delayedResult = await client.link.delayed(result.delayed)
   * }
   *
   * // With password
   * const protectedResult = await client.link.unlock(
   *   'https://example.com/protected.zip',
   *   'mypassword'
   * )
   * ```
   */
  async unlock(link: string, password?: string) {
    const params = password ? { password } : undefined
    return this.post<UnlockLinkResponse>('/link/unlock', { link }, params)
  }

  /**
   * Unlock a link and automatically poll if delayed
   * Note: The API response format doesn't include a delayed field in the current OpenAPI spec.
   * This method will be updated once the delayed mechanism is documented.
   *
   * @param link - The link to unlock
   * @param _options - Polling options (currently unused)
   *
   * @example
   * ```ts
   * const result = await client.link.unlockWithPolling('https://example.com/file.zip')
   * console.log('Direct link:', result.link)
   * ```
   */
  async unlockWithPolling(link: string, _options: PollOptions = {}) {
    // For now, just unlock without polling
    // TODO: Implement polling once delayed field is added to API response
    return this.unlock(link)
  }

  /**
   * Get streaming options for a generated link
   *
   * @param id - The generated link ID or streaming ID
   *
   * @example
   * ```ts
   * const streams = await client.link.streaming('abc123')
   * ```
   */
  async streaming(id: string, stream: string) {
    return this.post<GetStreamingLinkResponse>('/link/streaming', {
      id,
      stream,
    })
  }

  /**
   * Get the status/result of a delayed link generation
   *
   * @param id - The delayed generation ID
   *
   * @example
   * ```ts
   * const result = await client.link.delayed('delayed_id_123')
   * ```
   */
  async delayed(id: number) {
    return this.post<GetDelayedStatusResponse>('/link/delayed', {
      id,
    })
  }
}
