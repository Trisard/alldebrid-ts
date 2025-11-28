/**
 * Configuration options for the AllDebrid client
 */
export interface AllDebridConfig {
  /**
   * Your AllDebrid API key (Bearer token)
   */
  apiKey: string

  /**
   * User agent string to identify your application
   * @default '@alldebrid/sdk'
   */
  agent?: string

  /**
   * Base URL for the AllDebrid API
   * @default 'https://api.alldebrid.com/v4'
   */
  baseUrl?: string

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number

  /**
   * Enable automatic retries on failed requests
   * @default true
   */
  retry?: boolean

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  status: 'success' | 'error'
  data?: T
  error?: ApiError
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
}

/**
 * Extract the data type from a generated response type.
 * Generated types incorrectly wrap the data as { status, data }, so we extract just the data.
 */
export type ExtractData<T> = T extends { data?: infer D } ? NonNullable<D> | undefined : T
