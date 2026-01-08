import type {
  DeleteMagnetResponse,
  GetMagnetFilesResponse,
  GetMagnetStatusResponse,
  RestartMagnetResponse,
  UploadMagnetsResponse,
  UploadTorrentFileResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * Options for live mode status polling
 */
export interface LiveStatusOptions {
  /**
   * Session ID - Generate a random number and keep it consistent for the entire session
   * @example Math.floor(Math.random() * 1000000)
   */
  session: number

  /**
   * Counter for synchronization - Start at 0 and increment with each call
   * The API will return the next counter value to use
   */
  counter: number
}

/**
 * Options for watching magnet status
 */
export interface WatchOptions {
  /**
   * Polling interval in milliseconds
   * @default 3000
   */
  interval?: number

  /**
   * Maximum number of polling attempts (0 = infinite)
   * @default 0
   */
  maxAttempts?: number

  /**
   * Callback called on each status update
   */
  onUpdate?: (status: any) => void

  /**
   * Stop watching when magnet reaches this status
   * @default 'Ready'
   */
  stopOnStatus?: string
}

/**
 * Magnet/Torrent resource for managing torrent downloads
 */
export class MagnetResource extends BaseResource {
  /**
   * Upload magnets by URI or hash
   *
   * @param magnets - Single magnet URI/hash or array of magnets
   *
   * @example
   * ```ts
   * const result = await client.magnet.upload('magnet:?xt=urn:btih:...')
   * console.log('Magnet ID:', result.magnets[0].id)
   * ```
   */
  async upload(magnets: string | string[]) {
    const magnetsArray = Array.isArray(magnets) ? magnets : [magnets]
    return this.post<UploadMagnetsResponse>('/magnet/upload', {
      magnets: magnetsArray,
    })
  }

  /**
   * Upload a torrent file
   *
   * @param file - The torrent file (Blob or File)
   * @param filename - Optional filename (defaults to 'torrent.torrent' for Blob, or file.name for File)
   *
   * @example
   * ```ts
   * const file = new File([buffer], 'torrent.torrent')
   * const result = await client.magnet.uploadFile(file)
   *
   * // Or with a Blob and custom filename
   * const blob = new Blob([buffer])
   * const result = await client.magnet.uploadFile(blob, 'my-torrent.torrent')
   * ```
   */
  async uploadFile(file: Blob | File, filename?: string) {
    const formData = new FormData()

    // Determine the filename to use
    const actualFilename = filename || (file instanceof File ? file.name : 'torrent.torrent')

    // Append with explicit filename
    formData.append('files[]', file, actualFilename)

    return this.postFormData<UploadTorrentFileResponse>('/magnet/upload/file', formData)
  }

  /**
   * Get the status of a specific magnet by ID
   *
   * @param id - Magnet ID to get status for
   *
   * @example
   * ```ts
   * const status = await client.magnet.status(123)
   * console.log(status.magnets[0]?.status) // 'Downloading', 'Ready', etc.
   * ```
   *
   * @remarks
   * This endpoint uses AllDebrid API v4.1 (POST method)
   * Migrated from v4 GET endpoint which was deprecated on 2024-10-16
   */
  async status(id: number) {
    const data = await this.post<GetMagnetStatusResponse>('/magnet/status', { id })

    // Fix: AllDebrid API returns an object instead of array when filtering by ID
    // This is an API inconsistency, so we normalize it to always return an array
    if (data?.magnets && !Array.isArray(data.magnets)) {
      return {
        ...data,
        magnets: [data.magnets],
      }
    }

    return data
  }

  /**
   * Get list of magnets with optional status filter
   *
   * @param statusFilter - Optional filter by status: 'active', 'ready', 'expired', or 'error'
   *
   * @example
   * ```ts
   * // Get all magnets
   * const allMagnets = await client.magnet.statusList()
   *
   * // Get only active magnets
   * const activeMagnets = await client.magnet.statusList('active')
   *
   * // Get only ready magnets
   * const readyMagnets = await client.magnet.statusList('ready')
   * ```
   *
   * @remarks
   * This endpoint uses AllDebrid API v4.1 (POST method)
   */
  async statusList(statusFilter?: 'active' | 'ready' | 'expired' | 'error') {
    const body = statusFilter ? { status: statusFilter } : undefined
    return this.post<GetMagnetStatusResponse>('/magnet/status', body)
  }

  /**
   * Get magnet status using live mode for bandwidth-optimized delta synchronization
   *
   * Live mode is designed for monitoring multiple magnets efficiently by only transmitting
   * changes between polling intervals, drastically reducing bandwidth usage for dashboards
   * and real-time monitoring applications.
   *
   * ## How it works
   *
   * 1. **Session initialization**: Generate a random session ID and start with counter = 0
   * 2. **First call (fullsync)**: Returns ALL magnets with `fullsync: true`
   * 3. **Update counter**: Use the `counter` value returned by the API for the next call
   * 4. **Subsequent calls (delta)**: Returns ONLY magnets that changed since last call
   * 5. **Repeat**: Keep calling with updated counter to receive only deltas
   *
   * ## When to use
   *
   * - ✅ Monitoring multiple active magnets simultaneously
   * - ✅ Building real-time dashboards
   * - ✅ High-frequency polling scenarios (every few seconds)
   * - ❌ Watching a single specific magnet (use `watch()` instead)
   *
   * ## Important notes
   *
   * - **Don't use the `id` parameter**: Passing an ID defeats the purpose of live mode
   *   as it disables delta sync and behaves like a regular `status()` call
   * - **Session persistence**: Keep the same session ID for the entire monitoring session
   * - **Counter tracking**: Always update the counter with the value returned by the API
   * - **Empty deltas**: When no magnets changed, `magnets` will be an empty array
   *
   * @param options - Live mode session options
   * @param options.session - Unique session ID (generate once: `Math.floor(Math.random() * 1000000)`)
   * @param options.counter - Sync counter (start at 0, then use value from previous API response)
   *
   * @example
   * ```ts
   * // Initialize session
   * const session = Math.floor(Math.random() * 1000000)
   * let counter = 0
   *
   * // First call - returns all magnets (fullsync: true)
   * const firstCall = await client.magnet.statusLive({ session, counter })
   * console.log('Full sync:', firstCall.fullsync) // true
   * console.log('All magnets:', firstCall.magnets) // Array of all magnets
   * counter = firstCall.counter // Update counter for next call
   *
   * // Second call - returns only magnets that changed
   * await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
   * const secondCall = await client.magnet.statusLive({ session, counter })
   * console.log('Delta sync:', secondCall.magnets) // Only changed magnets
   * counter = secondCall.counter
   *
   * // Example: Monitor all magnets until none are active
   * const activeMagnets = new Map()
   *
   * while (true) {
   *   const response = await client.magnet.statusLive({ session, counter })
   *   counter = response.counter ?? counter
   *
   *   // Update our local state with changes
   *   if (response.fullsync) {
   *     activeMagnets.clear()
   *     response.magnets?.forEach(m => activeMagnets.set(m.id, m))
   *   } else {
   *     response.magnets?.forEach(m => {
   *       if (m.status === 'Ready' || m.status === 'Error' || m.status === 'Expired') {
   *         activeMagnets.delete(m.id)
   *       } else {
   *         activeMagnets.set(m.id, m)
   *       }
   *     })
   *   }
   *
   *   // Display current state
   *   console.log(`Active downloads: ${activeMagnets.size}`)
   *   activeMagnets.forEach(m => {
   *     console.log(`  ${m.filename}: ${m.status} - ${m.downloaded}/${m.size} bytes`)
   *   })
   *
   *   // Stop when no more active magnets
   *   if (activeMagnets.size === 0) {
   *     console.log('All downloads completed!')
   *     break
   *   }
   *
   *   await new Promise(resolve => setTimeout(resolve, 3000))
   * }
   * ```
   *
   * @remarks
   * This method is ideal for scenarios where you're monitoring multiple magnets and want
   * to minimize bandwidth. For simple single-magnet monitoring, use `watch()` instead.
   */
  async statusLive(options: LiveStatusOptions) {
    const body: any = {
      session: options.session,
      counter: options.counter,
    }

    return this.post<GetMagnetStatusResponse>('/magnet/status', body)
  }

  /**
   * Delete a magnet
   *
   * @param id - The magnet ID to delete
   *
   * @example
   * ```ts
   * await client.magnet.delete(123)
   * ```
   */
  async delete(id: number) {
    return this.post<DeleteMagnetResponse>('/magnet/delete', {
      id,
    })
  }

  /**
   * Restart one or more failed magnets
   *
   * @param ids - Single magnet ID or array of magnet IDs to restart (numbers)
   *
   * @example
   * ```ts
   * // Restart single magnet
   * await client.magnet.restart(123)
   *
   * // Restart multiple magnets
   * await client.magnet.restart([123, 456])
   * ```
   */
  async restart(ids: number | number[]) {
    const idsArray = Array.isArray(ids) ? ids : [ids]
    return this.post<RestartMagnetResponse>('/magnet/restart', {
      ids: idsArray,
    })
  }

  /**
   * Get files for a completed magnet
   *
   * @param ids - The magnet ID or IDs to get files for
   *
   * @example
   * ```ts
   * const data = await client.magnet.files(123)
   * data?.magnets?.forEach(magnet => {
   *   console.log(magnet.filename, magnet.files)
   * })
   * ```
   *
   * @remarks
   * Files are now retrieved separately from magnet status (since v4.1)
   * Only available for magnets with status 'Ready'
   */
  async files(ids: number | number[]) {
    const formData = new FormData()
    const idsArray = Array.isArray(ids) ? ids : [ids]
    for (const id of idsArray) {
      formData.append('id[]', String(id))
    }
    return this.postFormData<GetMagnetFilesResponse>('/magnet/files', formData)
  }

  /**
   * Watch a magnet's status with automatic polling
   *
   * This is a simple helper that polls the status of a specific magnet until it reaches
   * a target status (default: 'Ready'). For advanced use cases with multiple magnets
   * or bandwidth optimization, use `statusLive()` directly instead.
   *
   * @param id - The magnet ID to watch
   * @param options - Watch options
   * @param options.interval - Polling interval in milliseconds (default: 3000)
   * @param options.maxAttempts - Maximum polling attempts, 0 for infinite (default: 0)
   * @param options.onUpdate - Callback called on each status update
   * @param options.stopOnStatus - Stop when magnet reaches this status (default: 'Ready')
   *
   * @example
   * ```ts
   * await client.magnet.watch(123, {
   *   onUpdate: (status) => console.log('Status:', status.magnets[0]?.status),
   *   stopOnStatus: 'Ready'
   * })
   * ```
   *
   * @remarks
   * For monitoring multiple magnets efficiently, use `statusLive()` directly.
   * See the `statusLive()` documentation for details on delta synchronization.
   */
  async watch(id: number, options: WatchOptions = {}) {
    const { interval = 3000, maxAttempts = 0, onUpdate, stopOnStatus = 'Ready' } = options

    let attempt = 0

    while (maxAttempts === 0 || attempt < maxAttempts) {
      attempt++

      const status = await this.status(id)

      onUpdate?.(status)

      // Check if we should stop (magnets is normalized to an array with one element)
      const magnet = status?.magnets?.[0]
      if (magnet?.status === stopOnStatus) {
        return status
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    throw new Error(
      `Watch timeout: magnet did not reach '${stopOnStatus}' status after ${maxAttempts} attempts`,
    )
  }
}
