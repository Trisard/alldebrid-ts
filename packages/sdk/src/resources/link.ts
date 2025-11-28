import type {
  GetLinkDelayedResponse,
  GetLinkInfosResponse,
  GetLinkRedirectorResponse,
  GetLinkStreamingResponse,
  GetLinkUnlockResponse,
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
   *
   * @example
   * ```ts
   * const info = await client.link.infos('https://example.com/file.zip')
   * console.log(info)
   * ```
   */
  async infos(links: string | string[]) {
    const linksArray = Array.isArray(links) ? links : [links]
    const data = await this.get<GetLinkInfosResponse>('/link/infos', {
      link: linksArray,
    })
    return data?.infos
  }

  /**
   * Extract links from redirectors/link protectors
   *
   * @param link - The redirector link to extract from
   *
   * @example
   * ```ts
   * const links = await client.link.redirector('https://linkprotector.com/abc123')
   * ```
   */
  async redirector(link: string) {
    const data = await this.get<GetLinkRedirectorResponse>('/link/redirector', {
      link,
    })
    return data?.links
  }

  /**
   * Unlock a download link
   *
   * @param link - The link to unlock
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
   * ```
   */
  async unlock(link: string) {
    return this.get<GetLinkUnlockResponse>('/link/unlock', {
      link,
    })
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
  async streaming(id: string) {
    return this.get<GetLinkStreamingResponse>('/link/streaming', {
      id,
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
  async delayed(id: string) {
    return this.get<GetLinkDelayedResponse>('/link/delayed', {
      id,
    })
  }
}
