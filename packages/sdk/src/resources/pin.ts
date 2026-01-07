import type { CheckPinResponse, GetPinResponse } from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * Pin resource for PIN-based authentication flow
 *
 * The PIN flow allows users to authenticate without directly providing their API key.
 * This is useful for applications where you want users to authorize access through
 * the AllDebrid website.
 */
export class PinResource extends BaseResource {
  /**
   * Generate a new PIN code for authentication
   *
   * This initiates the PIN authentication flow. The user should visit the
   * returned URL to authorize the application.
   *
   * @example
   * ```ts
   * const pinData = await client.pin.generate()
   * console.log('Visit:', pinData.user_url)
   * console.log('PIN:', pinData.pin)
   *
   * // Poll the check endpoint until user authorizes
   * const auth = await client.pin.check(pinData.check, pinData.pin)
   * if (auth.activated) {
   *   console.log('API Key:', auth.apikey)
   * }
   * ```
   *
   * @returns PIN code and authorization URL
   */
  async generate() {
    return super.get<GetPinResponse>('/pin/get')
  }

  /**
   * Check the status of a PIN authentication
   *
   * Poll this endpoint to check if the user has authorized the application.
   * Once authorized, the response will include the API key.
   *
   * @param check - Check ID from /pin/get
   * @param pin - PIN code from /pin/get
   *
   * @example
   * ```ts
   * const pinData = await client.pin.generate()
   *
   * // Poll every few seconds until activated
   * const checkStatus = async () => {
   *   const result = await client.pin.check(pinData.check, pinData.pin)
   *   if (result?.activated && result?.apikey) {
   *     console.log('Authorized! API Key:', result.apikey)
   *     return result.apikey
   *   }
   *   // Wait and try again
   *   await new Promise(resolve => setTimeout(resolve, 3000))
   *   return checkStatus()
   * }
   *
   * const apikey = await checkStatus()
   * ```
   *
   * @returns Authorization status and API key (if activated)
   */
  async check(check: string, pin: string) {
    return super.get<CheckPinResponse>('/pin/check', { check, pin })
  }

  /**
   * Helper method to wait for PIN authorization with automatic polling
   *
   * This method handles the polling logic for you, making it easier to
   * implement the PIN authentication flow.
   *
   * @param check - Check ID from /pin/get
   * @param pin - PIN code from /pin/get
   * @param options - Polling options
   * @param options.timeout - Maximum time to wait in milliseconds (default: 600000 = 10 minutes)
   * @param options.interval - Polling interval in milliseconds (default: 3000 = 3 seconds)
   *
   * @example
   * ```ts
   * const pinData = await client.pin.generate()
   * console.log('Visit:', pinData.user_url)
   *
   * try {
   *   const apikey = await client.pin.waitForAuth(pinData.check, pinData.pin, {
   *     timeout: 600000, // 10 minutes
   *     interval: 3000,  // Check every 3 seconds
   *   })
   *   console.log('Authorized! API Key:', apikey)
   * } catch (error) {
   *   console.error('Authorization timed out or failed')
   * }
   * ```
   *
   * @returns The API key once authorized
   * @throws Error if timeout is reached or authorization fails
   */
  async waitForAuth(
    check: string,
    pin: string,
    options: {
      /** Maximum time to wait in milliseconds (default: 600000 = 10 minutes) */
      timeout?: number
      /** Polling interval in milliseconds (default: 3000 = 3 seconds) */
      interval?: number
    } = {},
  ): Promise<string> {
    const timeout = options.timeout ?? 600000 // 10 minutes default
    const interval = options.interval ?? 3000 // 3 seconds default
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const result = await this.check(check, pin)

      if (result?.activated && result?.apikey) {
        return result.apikey
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, interval))
    }

    throw new Error('PIN authorization timeout - user did not authorize within the time limit')
  }
}
