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
   * @param T - The generated response type (e.g., GetLinkUnlockResponse)
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async get<T>(path: string, params?: Record<string, unknown>): Promise<ExtractData<T>> {
    const clientAny = this.client as any
    return clientAny.get(path, params) as Promise<ExtractData<T>>
  }

  /**
   * Make a POST request
   * @param T - The generated response type
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async post<T>(
    path: string,
    body?: unknown,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    const clientAny = this.client as any
    return clientAny.post(path, body, params) as Promise<ExtractData<T>>
  }

  /**
   * Make a POST request with FormData (multipart/form-data)
   * @param T - The generated response type
   * @returns The extracted data from the response (without the { status, data } wrapper)
   */
  protected async postFormData<T>(
    path: string,
    formData: FormData,
    params?: Record<string, unknown>,
  ): Promise<ExtractData<T>> {
    const clientAny = this.client as any
    return clientAny.postFormData(path, formData, params) as Promise<ExtractData<T>>
  }
}
