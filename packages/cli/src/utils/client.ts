import { AllDebridClient } from '@adbjs/sdk'
import { config } from '../config.js'

export function createClient(apiKeyOverride?: string): AllDebridClient {
  const apiKey = apiKeyOverride || config.getApiKey()

  if (!apiKey) {
    throw new Error(
      'No API key found. Please run "adb auth login" or set ALLDEBRID_API_KEY environment variable.',
    )
  }

  return new AllDebridClient({
    apiKey,
    agent: '@adbjs/cli',
  })
}

export function getApiKey(): string {
  const apiKey = config.getApiKey()

  if (!apiKey) {
    throw new Error(
      'No API key found. Please run "adb auth login" or set ALLDEBRID_API_KEY environment variable.',
    )
  }

  return apiKey
}
