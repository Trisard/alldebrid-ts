import type {
  GetHostsDomainsResponse,
  GetHostsPriorityResponse,
  GetHostsResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * Host resource for getting information about supported hosts
 */
export class HostResource extends BaseResource {
  /**
   * Get list of all supported hosts with their information
   *
   * @param hostOnly - If true, only return hosts (exclude streams and redirectors)
   *
   * @example
   * ```ts
   * const hosts = await client.host.list()
   * console.log(hosts.hosts) // All supported file hosts
   * console.log(hosts.streams) // Streaming hosts
   * console.log(hosts.redirectors) // Link redirectors
   * ```
   */
  async list(hostOnly?: boolean) {
    const params = hostOnly ? { hostOnly: '1' } : undefined
    return this.get<GetHostsResponse>('/hosts', params)
  }

  /**
   * Get array of all supported domain names
   *
   * @example
   * ```ts
   * const domains = await client.host.domains()
   * console.log(domains) // ['rapidgator.net', 'uploaded.net', ...]
   * ```
   */
  async domains() {
    return this.get<GetHostsDomainsResponse>('/hosts/domains')
  }

  /**
   * Get hosts ordered by restriction level (priority list)
   *
   * @example
   * ```ts
   * const priority = await client.host.priority()
   * console.log(priority.hosts) // Ordered list with restriction levels
   * ```
   */
  async priority() {
    return this.get<GetHostsPriorityResponse>('/hosts/priority')
  }
}
