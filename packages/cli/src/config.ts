import Conf from 'conf'

interface ConfigSchema {
  apiKey?: string
}

export class Config {
  private store: Conf<ConfigSchema>

  constructor() {
    this.store = new Conf<ConfigSchema>({
      projectName: 'alldebrid',
      configName: 'config',
    })
  }

  getApiKey(): string | undefined {
    // Priority: env var > config file
    return process.env.ALLDEBRID_API_KEY || this.store.get('apiKey')
  }

  setApiKey(apiKey: string): void {
    this.store.set('apiKey', apiKey)
  }

  clearApiKey(): void {
    this.store.delete('apiKey')
  }

  hasApiKey(): boolean {
    return !!this.getApiKey()
  }

  getConfigPath(): string {
    return this.store.path
  }
}

export const config = new Config()
