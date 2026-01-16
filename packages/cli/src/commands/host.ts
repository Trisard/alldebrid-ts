import chalk from 'chalk'
import ora from 'ora'
import { createClient } from '../utils/client.js'
import { isJsonMode, output } from '../utils/output.js'

export async function hostList(hostsOnly?: boolean): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching supported hosts...').start()

  try {
    const hosts = await client.host.list()

    spinner?.stop()

    if (!hosts || (!hosts.hosts && !hosts.streams && !hosts.redirectors)) {
      output({ hosts: null }, () => console.log(chalk.yellow('No hosts information available')))
      return
    }

    output(hosts, () => {
      if (hostsOnly && hosts.hosts) {
        console.log(chalk.green(`\nSupported Hosts (${Object.keys(hosts.hosts).length}):\n`))

        const sortedHosts = Object.entries(hosts.hosts).sort(([a], [b]) => a.localeCompare(b))

        for (const [name, _] of sortedHosts) {
          console.log(`  ${chalk.cyan(name)}`)
        }

        console.log('')
        return
      }

      // Full display
      if (hosts.hosts) {
        console.log(chalk.bold('\nSupported Hosts:'))
        console.log(chalk.dim('─'.repeat(50)))

        const sortedHosts = Object.entries(hosts.hosts).sort(([a], [b]) => a.localeCompare(b))

        for (const [name, info] of sortedHosts) {
          const typeStr = info.type ? `(${info.type})` : ''
          console.log(`  ${chalk.cyan(name)} ${chalk.dim(typeStr)}`)
        }

        console.log('')
      }

      if (hosts.streams && Object.keys(hosts.streams).length > 0) {
        console.log(chalk.bold('Streaming Hosts:'))
        console.log(chalk.dim('─'.repeat(50)))

        const sortedStreams = Object.entries(hosts.streams).sort(([a], [b]) => a.localeCompare(b))

        for (const [name] of sortedStreams) {
          console.log(`  ${chalk.yellow(name)}`)
        }

        console.log('')
      }

      if (hosts.redirectors && Object.keys(hosts.redirectors).length > 0) {
        console.log(chalk.bold(`Supported Redirectors (${Object.keys(hosts.redirectors).length}):`))
        console.log(chalk.dim('─'.repeat(50)))

        const sortedRedirectors = Object.keys(hosts.redirectors).sort((a, b) => a.localeCompare(b))
        for (const redirector of sortedRedirectors) {
          console.log(`  ${chalk.magenta(redirector)}`)
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch hosts')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function hostDomains(): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching all supported domains...').start()

  try {
    const result = await client.host.domains()

    spinner?.stop()

    const allDomains: string[] = []
    if (result?.hosts) {
      allDomains.push(...result.hosts)
    }
    if (result?.streams) {
      allDomains.push(...result.streams)
    }
    if (result?.redirectors) {
      allDomains.push(...result.redirectors)
    }

    if (allDomains.length === 0) {
      output({ domains: [] }, () => console.log(chalk.yellow('No domains information available')))
      return
    }

    output(result, () => {
      console.log(chalk.green(`\nSupported Domains (${allDomains.length}):\n`))

      const sortedDomains = allDomains.sort((a, b) => a.localeCompare(b))

      for (const domain of sortedDomains) {
        console.log(`  ${chalk.cyan(domain)}`)
      }

      console.log('')
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch domains')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}
