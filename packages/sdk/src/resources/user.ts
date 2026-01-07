import type {
  ClearNotificationResponse,
  DeleteHistoryResponse,
  DeleteSavedLinksResponse,
  GetHistoryResponse,
  GetSavedLinksResponse,
  GetUserHostsResponse,
  GetUserResponse,
  GetVerifStatusResponse,
  ResendVerifResponse,
  SaveLinksResponse,
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
    await this.post<ClearNotificationResponse>('/user/notification/clear', { code })
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
    return this.get<GetSavedLinksResponse>('/user/links')
  }

  /**
   * Save one or multiple links for later use
   *
   * Supports batch operations - you can save multiple links in a single request.
   *
   * @param links - Single link or array of links to save
   *
   * @example
   * ```ts
   * // Save single link
   * await client.user.saveLink('https://example.com/file.zip')
   *
   * // Save multiple links at once
   * await client.user.saveLink([
   *   'https://example.com/file1.zip',
   *   'https://example.com/file2.zip',
   *   'https://example.com/file3.zip'
   * ])
   * ```
   */
  async saveLink(links: string | string[]) {
    const linksArray = Array.isArray(links) ? links : [links]
    const formData = new FormData()

    // API expects links[] array format
    for (const link of linksArray) {
      formData.append('links[]', link)
    }

    return this.postFormData<SaveLinksResponse>('/user/links/save', formData)
  }

  /**
   * Delete one or multiple saved links
   *
   * Supports batch operations - you can delete multiple links in a single request.
   *
   * @param links - Single link or array of links to delete (can be saved link IDs or URLs)
   *
   * @example
   * ```ts
   * // Delete single link
   * await client.user.deleteLink('saved-link-id')
   *
   * // Delete multiple links at once
   * await client.user.deleteLink([
   *   'saved-link-id-1',
   *   'saved-link-id-2',
   *   'saved-link-id-3'
   * ])
   * ```
   */
  async deleteLink(links: string | string[]) {
    const linksArray = Array.isArray(links) ? links : [links]
    const formData = new FormData()

    // API expects links[] array format
    for (const link of linksArray) {
      formData.append('links[]', link)
    }

    return this.postFormData<DeleteSavedLinksResponse>('/user/links/delete', formData)
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
    return this.get<GetHistoryResponse>('/user/history')
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
    return this.post<DeleteHistoryResponse>('/user/history/delete')
  }

  // ============================================
  // Email Verification
  // ============================================

  /**
   * Check email verification status
   *
   * @param token - Verification token
   *
   * @example
   * ```ts
   * const status = await client.user.getVerificationStatus('verification-token')
   * console.log(status.verif) // 'waiting', 'allowed', or 'denied'
   * ```
   */
  async getVerificationStatus(token: string) {
    return this.post<GetVerifStatusResponse>('/user/verif', undefined, { token })
  }

  /**
   * Resend verification email
   *
   * @param token - Verification token
   *
   * @example
   * ```ts
   * await client.user.resendVerification('verification-token')
   * ```
   */
  async resendVerification(token: string) {
    return this.post<ResendVerifResponse>('/user/verif/resend', undefined, { token })
  }
}
