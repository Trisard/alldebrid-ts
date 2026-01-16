import * as clack from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { createClient } from '../utils/client.js'
import { isJsonMode, output } from '../utils/output.js'

export async function linkUnlock(url: string, password?: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Unlocking link...').start()

  try {
    const result = await client.link.unlock(url, password)

    spinner?.succeed(chalk.green('Link unlocked successfully!'))

    output(result, () => {
      if (result) {
        console.log(chalk.dim('\nUnlocked Link Information:'))
        console.log(`  Filename: ${chalk.cyan(result.filename || 'N/A')}`)
        console.log(`  Size: ${chalk.cyan(formatBytes(result.filesize || 0))}`)
        console.log(`  Host: ${chalk.cyan(result.host || 'N/A')}`)

        if (result.id) {
          console.log(`  ID: ${chalk.cyan(result.id)}`)
        }

        console.log(`\n  ${chalk.blue.underline(result.link || 'N/A')}`)

        if (result.streams && result.streams.length > 0) {
          console.log(chalk.dim('\nAvailable Streams:'))
          for (const stream of result.streams) {
            console.log(`  ${chalk.yellow(JSON.stringify(stream))}`)
          }
        }
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to unlock link')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function linkInfo(url: string, password?: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching link information...').start()

  try {
    const data = await client.link.infos(url, password)

    spinner?.stop()

    if (!data?.infos || data.infos.length === 0) {
      output({ infos: [] }, () => console.log(chalk.yellow('No link information available')))
      return
    }

    output(data, () => {
      for (const info of data.infos!) {
        console.log(chalk.bold('\nLink Information:'))
        console.log(chalk.dim('─'.repeat(50)))
        console.log(`Filename: ${chalk.cyan(info.filename || 'N/A')}`)
        console.log(`Size: ${chalk.cyan(formatBytes(info.size || 0))}`)
        console.log(`Host: ${chalk.cyan(info.host || 'N/A')}`)

        if (info.hostDomain) {
          console.log(`Host Domain: ${chalk.cyan(info.hostDomain)}`)
        }

        if (info.link) {
          console.log(`Link: ${chalk.blue.underline(info.link)}`)
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch link information')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function linkStream(id: string, stream: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching streaming link...').start()

  try {
    const result = await client.link.streaming(id, stream)

    spinner?.succeed(chalk.green('Streaming link retrieved!'))

    output(result, () => {
      if (result) {
        console.log(chalk.dim('\nStreaming Information:'))
        console.log(`  Filename: ${chalk.cyan(result.filename || 'N/A')}`)
        console.log(`  Size: ${chalk.cyan(formatBytes(result.filesize || 0))}`)

        if (result.delayed) {
          console.log(chalk.yellow(`\n  ⏱  Delayed by ${result.delayed} seconds`))
        }

        console.log(`\n  ${chalk.blue.underline(result.link || 'N/A')}`)
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch streaming link')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function linkRedirector(url: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Extracting links from redirector...').start()

  try {
    const data = await client.link.redirector(url)

    spinner?.stop()

    if (!data?.links || data.links.length === 0) {
      output({ links: [] }, () => console.log(chalk.yellow('No links found')))
      return
    }

    output(data, () => {
      console.log(chalk.green(`\nFound ${data.links!.length} link(s):\n`))

      for (const link of data.links!) {
        console.log(`  ${chalk.blue.underline(link)}`)
      }

      console.log('')
    })
  } catch (error: any) {
    spinner?.fail('Failed to extract links from redirector')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function linkInteractive(): Promise<void> {
  clack.intro(chalk.cyan('Link Management'))

  const action = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'unlock', label: 'Unlock premium link' },
      { value: 'info', label: 'Get link information' },
      { value: 'stream', label: 'Get streaming link' },
      { value: 'redirector', label: 'Extract from redirector' },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }

  switch (action) {
    case 'unlock': {
      const url = await clack.text({
        message: 'Enter link to unlock:',
        validate: (value) => {
          if (!value) return 'Please enter a link'
          return undefined
        },
      })

      if (clack.isCancel(url)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      const needsPassword = await clack.confirm({
        message: 'Does this link require a password?',
        initialValue: false,
      })

      let password: string | undefined

      if (!clack.isCancel(needsPassword) && needsPassword) {
        const passwordInput = await clack.password({
          message: 'Enter password:',
        })

        if (clack.isCancel(passwordInput)) {
          clack.cancel('Operation cancelled.')
          process.exit(0)
        }

        password = passwordInput
      }

      await linkUnlock(url, password)
      break
    }

    case 'info': {
      const url = await clack.text({
        message: 'Enter link URL:',
        validate: (value) => {
          if (!value) return 'Please enter a link'
          return undefined
        },
      })

      if (clack.isCancel(url)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await linkInfo(url)
      break
    }

    case 'stream': {
      const id = await clack.text({
        message: 'Enter link ID:',
        validate: (value) => {
          if (!value) return 'Please enter a link ID'
          return undefined
        },
      })

      if (clack.isCancel(id)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      const stream = await clack.text({
        message: 'Enter stream quality (e.g., "original", "1080p"):',
        validate: (value) => {
          if (!value) return 'Please enter a stream quality'
          return undefined
        },
      })

      if (clack.isCancel(stream)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await linkStream(id, stream)
      break
    }

    case 'redirector': {
      const url = await clack.text({
        message: 'Enter redirector URL:',
        validate: (value) => {
          if (!value) return 'Please enter a redirector URL'
          return undefined
        },
      })

      if (clack.isCancel(url)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await linkRedirector(url)
      break
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
