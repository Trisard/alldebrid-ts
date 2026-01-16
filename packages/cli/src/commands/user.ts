import * as clack from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { createClient } from '../utils/client.js'
import { isJsonMode, output } from '../utils/output.js'

export async function userInfo(): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching user information...').start()

  try {
    const data = await client.user.getInfo()

    spinner?.stop()

    output(data, () => {
      if (data?.user) {
        const userInfo = data.user
        console.log(chalk.bold('\nUser Information:'))
        console.log(chalk.dim('─'.repeat(50)))
        console.log(`Username: ${chalk.cyan(userInfo.username || 'N/A')}`)
        console.log(`Email: ${chalk.cyan(userInfo.email || 'N/A')}`)
        console.log(`Premium: ${userInfo.isPremium ? chalk.green('Yes') : chalk.yellow('No')}`)

        if (userInfo.premiumUntil) {
          const expiryDate = new Date(userInfo.premiumUntil * 1000)
          console.log(`Premium Until: ${chalk.cyan(expiryDate.toLocaleDateString())}`)
        }

        if (userInfo.remainingTrialQuota !== undefined) {
          console.log(
            `Remaining Trial Quota: ${chalk.cyan(formatBytes(userInfo.remainingTrialQuota))}`,
          )
        }

        if (userInfo.fidelityPoints !== undefined) {
          console.log(`Fidelity Points: ${chalk.cyan(userInfo.fidelityPoints)}`)
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch user information')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userSavedList(): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching saved links...').start()

  try {
    const result = await client.user.getLinks()

    spinner?.stop()

    if (!result?.links || result.links.length === 0) {
      output({ links: [] }, () => console.log(chalk.yellow('No saved links found')))
      return
    }

    output(result, () => {
      console.log(chalk.green(`\nFound ${result.links!.length} saved link(s):\n`))

      for (const link of result.links!) {
        console.log(`${chalk.bold(link.filename || 'N/A')}`)
        console.log(`  Link: ${chalk.blue.underline(link.link || 'N/A')}`)
        console.log(`  Size: ${chalk.cyan(formatBytes(link.size || 0))}`)
        console.log(`  Host: ${chalk.cyan(link.host || 'N/A')}`)

        if (link.date) {
          const date = new Date(link.date * 1000)
          console.log(`  Date: ${chalk.dim(date.toLocaleString())}`)
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch saved links')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userSavedAdd(urls: string | string[]): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Saving link(s)...').start()

  try {
    await client.user.saveLink(urls)
    const count = Array.isArray(urls) ? urls.length : 1
    output({ success: true, count }, () => {
      spinner?.succeed(chalk.green(`${count} link(s) saved successfully!`))
    })
  } catch (error: any) {
    spinner?.fail('Failed to save link(s)')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userSavedDelete(links: string | string[]): Promise<void> {
  const client = createClient()

  // Skip confirmation in JSON mode
  if (!isJsonMode()) {
    const shouldDelete = await clack.confirm({
      message: `Delete ${Array.isArray(links) ? links.length : 1} saved link(s)?`,
      initialValue: false,
    })

    if (clack.isCancel(shouldDelete) || !shouldDelete) {
      clack.cancel('Deletion cancelled.')
      return
    }
  }

  const spinner = isJsonMode() ? null : ora('Deleting saved link(s)...').start()

  try {
    await client.user.deleteLink(links)
    const count = Array.isArray(links) ? links.length : 1
    output({ success: true, count }, () => {
      spinner?.succeed(chalk.green(`${count} saved link(s) deleted successfully`))
    })
  } catch (error: any) {
    spinner?.fail('Failed to delete saved link(s)')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userHistory(): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching download history...').start()

  try {
    const result = await client.user.getHistory()

    spinner?.stop()

    if (!result?.links || result.links.length === 0) {
      output({ links: [] }, () => console.log(chalk.yellow('No download history found')))
      return
    }

    output(result, () => {
      console.log(chalk.green(`\nDownload History (${result.links!.length} item(s)):\n`))

      for (const item of result.links!) {
        console.log(`${chalk.bold(item.filename || 'N/A')}`)
        console.log(`  Link: ${chalk.blue.underline(item.link || 'N/A')}`)

        if (item.date) {
          const date = new Date(item.date * 1000)
          console.log(`  Date: ${chalk.dim(date.toLocaleString())}`)
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch download history')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userHistoryClear(): Promise<void> {
  const client = createClient()

  // Skip confirmation in JSON mode
  if (!isJsonMode()) {
    const shouldClear = await clack.confirm({
      message: 'Clear your entire download history?',
      initialValue: false,
    })

    if (clack.isCancel(shouldClear) || !shouldClear) {
      clack.cancel('Operation cancelled.')
      return
    }
  }

  const spinner = isJsonMode() ? null : ora('Clearing download history...').start()

  try {
    await client.user.clearHistory()
    output({ success: true }, () => {
      spinner?.succeed(chalk.green('Download history cleared successfully'))
    })
  } catch (error: any) {
    spinner?.fail('Failed to clear download history')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function userInteractive(): Promise<void> {
  clack.intro(chalk.cyan('User Management'))

  const action = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'info', label: 'View account information' },
      { value: 'saved-list', label: 'List saved links' },
      { value: 'saved-add', label: 'Save new link' },
      { value: 'saved-delete', label: 'Delete saved link' },
      { value: 'history', label: 'View download history' },
      { value: 'history-clear', label: 'Clear download history' },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }

  switch (action) {
    case 'info':
      await userInfo()
      break

    case 'saved-list':
      await userSavedList()
      break

    case 'saved-add': {
      const link = await clack.text({
        message: 'Enter link to save:',
        validate: (value) => {
          if (!value) return 'Please enter a link'
          return undefined
        },
      })

      if (clack.isCancel(link)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await userSavedAdd(link)
      break
    }

    case 'saved-delete': {
      const link = await clack.text({
        message: 'Enter link to delete:',
        validate: (value) => {
          if (!value) return 'Please enter a link'
          return undefined
        },
      })

      if (clack.isCancel(link)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await userSavedDelete(link)
      break
    }

    case 'history':
      await userHistory()
      break

    case 'history-clear':
      await userHistoryClear()
      break
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}
