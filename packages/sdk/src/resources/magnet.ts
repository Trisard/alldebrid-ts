import type {
  GetMagnetDeleteResponse,
  GetMagnetInstantResponse,
  GetMagnetRestartResponse,
  GetMagnetStatusResponse,
  GetMagnetUploadResponse,
  PostMagnetUploadFileResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

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
    return this.get<GetMagnetUploadResponse>('/magnet/upload', {
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

    return this.postFormData<PostMagnetUploadFileResponse['data']>('/magnet/upload/file', formData)
  }

  /**
   * Get the status of one or more magnets
   *
   * @param id - Optional magnet ID to get status for a specific magnet
   *
   * @example
   * ```ts
   * // Get all magnets status
   * const allStatus = await client.magnet.status()
   *
   * // Get specific magnet status
   * const status = await client.magnet.status('123')
   * console.log(status.magnets[0]?.status) // 'Downloading', 'Ready', etc.
   * ```
   */
  async status(id?: string) {
    const params = id ? { id } : undefined
    const data = await this.get<GetMagnetStatusResponse>('/magnet/status', params)

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
   * Delete a magnet
   *
   * @param id - The magnet ID to delete (string)
   *
   * @example
   * ```ts
   * await client.magnet.delete('123')
   * ```
   */
  async delete(id: string) {
    return this.get<GetMagnetDeleteResponse>('/magnet/delete', {
      id,
    })
  }

  /**
   * Restart one or more failed magnets
   *
   * @param ids - Single magnet ID or array of magnet IDs to restart (strings)
   *
   * @example
   * ```ts
   * // Restart single magnet
   * await client.magnet.restart('123')
   *
   * // Restart multiple magnets
   * await client.magnet.restart(['123', '456'])
   * ```
   */
  async restart(ids: string | string[]) {
    const idsArray = Array.isArray(ids) ? ids : [ids]
    return this.get<GetMagnetRestartResponse>('/magnet/restart', {
      ids: idsArray,
    })
  }

  /**
   * Check instant availability of magnets
   *
   * @param magnets - Single magnet hash or array of hashes
   *
   * @example
   * ```ts
   * const available = await client.magnet.instant(['hash1', 'hash2'])
   * console.log(available.magnets)
   * ```
   */
  async instant(magnets: string | string[]) {
    const magnetsArray = Array.isArray(magnets) ? magnets : [magnets]
    return this.get<GetMagnetInstantResponse>('/magnet/instant', {
      magnets: magnetsArray,
    })
  }

  /**
   * Watch a magnet's status with automatic polling
   *
   * @param id - The magnet ID to watch (string)
   * @param options - Watch options
   *
   * @example
   * ```ts
   * await client.magnet.watch('123', {
   *   onUpdate: (status) => console.log('Status:', status.magnets[0]?.status),
   *   stopOnStatus: 'Ready'
   * })
   * ```
   */
  async watch(id: string, options: WatchOptions = {}) {
    const { interval = 3000, maxAttempts = 0, onUpdate, stopOnStatus = 'Ready' } = options

    let attempt = 0

    while (maxAttempts === 0 || attempt < maxAttempts) {
      attempt++

      const status = await this.status(id)
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
