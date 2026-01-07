import type { AllDebridClient } from './client.js'
import type { ExtractData } from './types.js'

/**
 * Base class for all resources
 * Provides access to HTTP methods
 * @internal
 */
export abstract class BaseResource {
  constructor(protected readonly client: AllDebridClient) {}

  /**
   * Make a GET request
   * @template T - The generated response type (e.g., GetLinkUnlockResponse)
   * @param path - API endpoint path
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async get<T>(path: string, params?: Record<string, unknown>): Promise<ExtractData<T>> {
    return this.client.get<T>(path, params)
  }

  /**
   * Make a POST request
   * @template T - The generated response type
   * @param path - API endpoint path
   * @param body - Request body
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    return this.client.post<T>(path, body, params)
  }

  /**
   * Make a POST request with FormData (multipart/form-data)
   * @template T - The generated response type
   * @param path - API endpoint path
   * @param formData - Form data to send
   * @param params - Optional query parameters
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async postFormData<T>(
    path: string,
    formData: FormData,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    return this.client.postFormData<T>(path, formData, params)
  }
}
