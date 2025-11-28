import { describe, expect, it } from 'vitest'
import { AllDebridClient } from '../src/index.js'

describe('allDebridClient', () => {
  it('should create a client instance', () => {
    const client = new AllDebridClient({
      apiKey: 'test-api-key',
    })

    expect(client).toBeDefined()
    expect(client.user).toBeDefined()
    expect(client.link).toBeDefined()
    expect(client.magnet).toBeDefined()
    expect(client.host).toBeDefined()
  })

  it('should use custom configuration', () => {
    const client = new AllDebridClient({
      apiKey: 'test-api-key',
      agent: 'my-custom-agent',
      baseUrl: 'https://custom.api.com',
      timeout: 5000,
    })

    expect(client).toBeDefined()
  })
})
