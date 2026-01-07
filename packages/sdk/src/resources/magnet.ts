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

  /**
   * Use live mode for reduced bandwidth (delta sync)
   * When enabled, only changes are transmitted instead of full status
   * @default false
   */
  useLiveMode?: boolean
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
   * Get magnet status using live mode for reduced bandwidth consumption
   *
   * Live mode uses delta synchronization - only changes since the last call are transmitted.
   * On the first call (counter=0), all data is returned with `fullsync: true`.
   * Subsequent calls return only modifications.
   *
   * @param options - Live mode options
   * @param options.session - Session ID (generate once per session and reuse)
   * @param options.counter - Synchronization counter (start at 0, use returned counter for next call)
   * @param id - Optional magnet ID to filter a specific magnet
   *
   * @example
   * ```ts
   * // Initialize session
   * const session = Math.floor(Math.random() * 1000000)
   * let counter = 0
   *
   * // First call - full sync
   * const firstCall = await client.magnet.statusLive({ session, counter })
   * console.log('Full sync:', firstCall.fullsync) // true
   * console.log('All magnets:', firstCall.magnets)
   *
   * // Update counter with value returned by API
   * counter = firstCall.counter
   *
   * // Second call - only changes
   * const secondCall = await client.magnet.statusLive({ session, counter })
   * console.log('Delta sync:', secondCall.magnets) // Only modified magnets
   *
   * // Filter specific magnet in live mode
   * const magnetLive = await client.magnet.statusLive({ session, counter }, 123)
   * ```
   *
   * @remarks
   * This is ideal for real-time dashboards or frequent polling scenarios
   * as it significantly reduces bandwidth usage by transmitting only changes.
   */
  async statusLive(options: LiveStatusOptions, id?: number) {
    const body: any = {
      session: options.session,
      counter: options.counter,
    }

    if (id !== undefined) {
      body.id = id
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
   * const files = await client.magnet.files(123)
   * files?.forEach(file => {
   *   console.log(file.filename, file.link)
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
    const data = await this.postFormData<GetMagnetFilesResponse>('/magnet/files', formData)
    return data?.magnets
  }

  /**
   * Watch a magnet's status with automatic polling
   *
   * @param id - The magnet ID to watch
   * @param options - Watch options
   * @param options.interval - Polling interval in milliseconds (default: 3000)
   * @param options.maxAttempts - Maximum polling attempts, 0 for infinite (default: 0)
   * @param options.onUpdate - Callback called on each status update
   * @param options.stopOnStatus - Stop when magnet reaches this status (default: 'Ready')
   * @param options.useLiveMode - Use live mode for reduced bandwidth (default: false)
   *
   * @example
   * ```ts
   * // Standard mode
   * await client.magnet.watch(123, {
   *   onUpdate: (status) => console.log('Status:', status.magnets[0]?.status),
   *   stopOnStatus: 'Ready'
   * })
   *
   * // Live mode for reduced bandwidth
   * await client.magnet.watch(123, {
   *   useLiveMode: true,
   *   interval: 2000,
   *   onUpdate: (status) => console.log('Update:', status)
   * })
   * ```
   */
  async watch(id: number, options: WatchOptions = {}) {
    const {
      interval = 3000,
      maxAttempts = 0,
      onUpdate,
      stopOnStatus = 'Ready',
      useLiveMode = false,
    } = options

    let attempt = 0

    // Live mode session state
    let session: number | undefined
    let counter = 0

    if (useLiveMode) {
      session = Math.floor(Math.random() * 1000000)
    }

    while (maxAttempts === 0 || attempt < maxAttempts) {
      attempt++

      // Use appropriate status method based on mode
      const status =
        useLiveMode && session !== undefined
          ? await this.statusLive({ session, counter }, id)
          : await this.status(id)

      // Update counter for next live mode call
      if (useLiveMode && status?.counter !== undefined) {
        counter = status.counter
      }

      onUpdate?.(status)

      // Check if we should stop (magnets is an array)
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
