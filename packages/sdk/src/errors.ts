import type { ApiError } from './types.js'

/**
 * Base error class for AllDebrid SDK errors
 */
export class AllDebridError extends Error {
  public readonly code: string
  public readonly isAllDebridError = true

  constructor(code: string, message: string) {
    super(message)
    this.name = 'AllDebridError'
    this.code = code

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if ('captureStackTrace' in Error && typeof (Error as any).captureStackTrace === 'function') {
      ;(Error as any).captureStackTrace(this, AllDebridError)
    }
  }

  /**
   * Create an AllDebridError from an API error response
   */
  static fromApiError(error: ApiError): AllDebridError {
    return new AllDebridError(error.code, error.message)
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends AllDebridError {
  constructor(code: string, message: string) {
    super(code, message)
    this.name = 'AuthenticationError'
  }
}

/**
 * Link processing errors
 */
export class LinkError extends AllDebridError {
  constructor(code: string, message: string) {
    super(code, message)
    this.name = 'LinkError'
  }
}

/**
 * Magnet/Torrent related errors
 */
export class MagnetError extends AllDebridError {
  constructor(code: string, message: string) {
    super(code, message)
    this.name = 'MagnetError'
  }
}

/**
 * Network/HTTP errors
 */
export class NetworkError extends AllDebridError {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super('NETWORK_ERROR', message)
    this.name = 'NetworkError'
  }
}

/**
 * Helper to determine error type from error code
 */
export function createTypedError(code: string, message: string): AllDebridError {
  if (code.startsWith('AUTH_')) {
    return new AuthenticationError(code, message)
  }
  if (
    code.startsWith('LINK_') ||
    code.startsWith('REDIRECTOR_') ||
    code.startsWith('STREAM_') ||
    code.startsWith('DELAYED_')
  ) {
    return new LinkError(code, message)
  }
  if (code.startsWith('MAGNET_')) {
    return new MagnetError(code, message)
  }
  return new AllDebridError(code, message)
}
