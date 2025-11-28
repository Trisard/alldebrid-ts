import type {
  GetUserHistoryDeleteResponse,
  GetUserHistoryResponse,
  GetUserHostsResponse,
  GetUserLinksDeleteResponse,
  GetUserLinksResponse,
  GetUserLinksSaveResponse,
  GetUserResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * User resource for managing user account information
 */
export class UserResource extends BaseResource {
  /**
   * Get user profile information including premium status and quotas
   *
   * @example
   * ```ts
   * const user = await client.user.getInfo()
   * console.log(user.username, user.isPremium)
   * ```
   */
  async getInfo() {
    const data = await this.get<GetUserResponse>('/user')
    return data?.user
  }

  /**
   * Get available hosts for the current user based on their subscription
   *
   * @param hostOnly - If true, only return hosts data (exclude streams and redirectors)
   *
   * @example
   * ```ts
   * const hosts = await client.user.getHosts()
   * console.log(Object.keys(hosts.hosts))
   * ```
   */
  async getHosts(hostOnly?: boolean) {
    const params = hostOnly ? { hostOnly: '1' } : undefined
    return this.get<GetUserHostsResponse>('/user/hosts', params)
  }

  /**
   * Clear a specific notification by code
   *
   * @param code - The notification code to clear
   *
   * @example
   * ```ts
   * await client.user.clearNotification('SOME_NOTIF_CODE')
   * ```
   */
  async clearNotification(code: string) {
    await this.get('/user/notification/clear', { code })
  }

  // ============================================
  // Saved Links Management
  // ============================================

  /**
   * Get all saved links
   *
   * @example
   * ```ts
   * const savedLinks = await client.user.getLinks()
   * console.log(savedLinks.links)
   * ```
   */
  async getLinks() {
    return this.get<GetUserLinksResponse>('/user/links')
  }

  /**
   * Save a link for later use
   *
   * @param link - The link to save
   *
   * @example
   * ```ts
   * await client.user.saveLink('https://example.com/file.zip')
   * ```
   */
  async saveLink(link: string) {
    return this.get<GetUserLinksSaveResponse>('/user/links/save', { link })
  }

  /**
   * Delete a saved link
   *
   * @param link - The link to delete (can be the saved link ID or URL)
   *
   * @example
   * ```ts
   * await client.user.deleteLink('saved-link-id')
   * ```
   */
  async deleteLink(link: string) {
    return this.get<GetUserLinksDeleteResponse>('/user/links/delete', { link })
  }

  // ============================================
  // History Management
  // ============================================

  /**
   * Get user history (if enabled in account settings)
   *
   * @example
   * ```ts
   * const history = await client.user.getHistory()
   * console.log(history.links)
   * ```
   */
  async getHistory() {
    return this.get<GetUserHistoryResponse>('/user/history')
  }

  /**
   * Clear user history
   *
   * @example
   * ```ts
   * await client.user.clearHistory()
   * ```
   */
  async clearHistory() {
    return this.get<GetUserHistoryDeleteResponse>('/user/history/delete')
  }
}
