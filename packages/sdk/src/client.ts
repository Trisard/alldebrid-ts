import type { PingResponse } from './generated/types.gen.js'
import type { AllDebridConfig, ApiResponse, ExtractData } from './types.js'
import wretch from 'wretch'
import { createTypedError, NetworkError } from './errors.js'
import { HostResource } from './resources/host.js'
import { LinkResource } from './resources/link.js'
import { MagnetResource } from './resources/magnet.js'
import { PinResource } from './resources/pin.js'
import { UserResource } from './resources/user.js'
import { VoucherResource } from './resources/voucher.js'

const DEFAULT_BASE_URL = 'https://api.alldebrid.com/v4.1'
const DEFAULT_AGENT = '@alldebrid/sdk'
const DEFAULT_TIMEOUT = 30000
const DEFAULT_MAX_RETRIES = 3

/**
 * Main AllDebrid client class
 */
export class AllDebridClient {
  private readonly config: Required<AllDebridConfig>

  /**
   * User resource for managing user account
   */
  public readonly user: UserResource

  /**
   * Link resource for unlocking and managing download links
   */
  public readonly link: LinkResource

  /**
   * Magnet resource for managing torrents
   */
  public readonly magnet: MagnetResource

  /**
   * Host resource for getting information about supported hosts
   */
  public readonly host: HostResource

  /**
   * Pin resource for PIN-based authentication
   */
  public readonly pin: PinResource

  /**
   * Voucher resource for reseller voucher management
   */
  public readonly voucher: VoucherResource

  constructor(config: AllDebridConfig) {
    // Merge config with defaults
    this.config = {
      apiKey: config.apiKey,
      agent: config.agent ?? DEFAULT_AGENT,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
      retry: config.retry ?? true,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
    }

    // Initialize resources
    this.user = new UserResource(this)
    this.link = new LinkResource(this)
    this.magnet = new MagnetResource(this)
    this.host = new HostResource(this)
    this.pin = new PinResource(this)
    this.voucher = new VoucherResource(this)
  }

  /**
   * Build query string from params
   */
  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const allParams = {
      agent: this.config.agent,
      ...params,
    }

    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(allParams)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => query.append(`${key}[]`, String(v)))
        } else {
          query.append(key, String(value))
        }
      }
    }

    const queryString = query.toString()
    return queryString ? `${path}?${queryString}` : path
  }

  /**
   * Make a GET request
   * @template T - The generated response type (e.g., GetLinkUnlockResponse)
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   * @internal
   */
  async get<T>(path: string, params?: Record<string, unknown>): Promise<ExtractData<T>> {
    try {
      const url = this.buildUrl(path, params)
      const json = await wretch(this.config.baseUrl)
        .auth(`Bearer ${this.config.apiKey}`)
        .url(url)
        .get()
        .json<ApiResponse<unknown>>()

      // Handle error responses
      if (json.status === 'error' && json.error) {
        throw createTypedError(json.error.code, json.error.message)
      }

      return json.data as ExtractData<T>
    } catch (error: any) {
      // Handle HTTP errors
      if (error.status === 401) {
        throw createTypedError('AUTH_BAD_APIKEY', 'Invalid API key or unauthorized access')
      }
      if (error.status === 403) {
        throw createTypedError('AUTH_BLOCKED', 'Access forbidden')
      }
      if (error.status === 429) {
        throw createTypedError('RATE_LIMITED', 'Too many requests')
      }

      // Re-throw if already our error type
      if (error.isAllDebridError) {
        throw error
      }

      // Wrap in NetworkError
      throw new NetworkError(error.message || 'Network error occurred', error.status)
    }
  }

  /**
   * Make a POST request with application/x-www-form-urlencoded
   * @template T - The generated response type
   * @param path - API endpoint path
   * @param body - Request body (will be converted to URLSearchParams)
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   * @internal
   */
  async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    try {
      const url = this.buildUrl(path, params)

      // Convert body to URLSearchParams for application/x-www-form-urlencoded
      const formData = new URLSearchParams()
      if (body && typeof body === 'object') {
        for (const [key, value] of Object.entries(body)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              // Handle arrays (e.g., link[] for multiple links)
              value.forEach((v) => formData.append(key, String(v)))
            } else {
              formData.append(key, String(value))
            }
          }
        }
      }

      const json = await wretch(this.config.baseUrl)
        .auth(`Bearer ${this.config.apiKey}`)
        .url(url)
        .body(formData)
        .post()
        .json<ApiResponse<unknown>>()

      // Handle error responses
      if (json.status === 'error' && json.error) {
        throw createTypedError(json.error.code, json.error.message)
      }

      return json.data as ExtractData<T>
    } catch (error: any) {
      // Handle HTTP errors
      if (error.status === 401) {
        throw createTypedError('AUTH_BAD_APIKEY', 'Invalid API key or unauthorized access')
      }
      if (error.status === 403) {
        throw createTypedError('AUTH_BLOCKED', 'Access forbidden')
      }
      if (error.status === 429) {
        throw createTypedError('RATE_LIMITED', 'Too many requests')
      }

      // Re-throw if already our error type
      if (error.isAllDebridError) {
        throw error
      }

      // Wrap in NetworkError
      throw new NetworkError(error.message || 'Network error occurred', error.status)
    }
  }

  /**
   * Make a POST request with FormData (multipart/form-data)
   * @template T - The generated response type
   * @param path - API endpoint path
   * @param formData - Form data to send
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   * @internal
   */
  async postFormData<T>(
    path: string,
    formData: FormData,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    try {
      const url = this.buildUrl(path, params)
      const json = await wretch(this.config.baseUrl)
        .auth(`Bearer ${this.config.apiKey}`)
        .url(url)
        .body(formData)
        .post()
        .json<ApiResponse<unknown>>()

      // Handle error responses
      if (json.status === 'error' && json.error) {
        throw createTypedError(json.error.code, json.error.message)
      }

      return json.data as ExtractData<T>
    } catch (error: any) {
      // Handle HTTP errors
      if (error.status === 401) {
        throw createTypedError('AUTH_BAD_APIKEY', 'Invalid API key or unauthorized access')
      }
      if (error.status === 403) {
        throw createTypedError('AUTH_BLOCKED', 'Access forbidden')
      }
      if (error.status === 429) {
        throw createTypedError('RATE_LIMITED', 'Too many requests')
      }

      // Re-throw if already our error type
      if (error.isAllDebridError) {
        throw error
      }

      // Wrap in NetworkError
      throw new NetworkError(error.message || 'Network error occurred', error.status)
    }
  }

  /**
   * Test the API connection
   *
   * This endpoint doesn't require authentication and can be used to verify
   * that the AllDebrid API is reachable.
   *
   * @example
   * ```ts
   * const result = await client.ping()
   * console.log(result.ping) // 'pong'
   * ```
   *
   * @returns Ping response with 'pong' message
   */
  async ping() {
    return this.get<PingResponse>('/ping')
  }
}
