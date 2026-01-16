import { readFileSync } from 'node:fs'
import * as clack from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { createClient } from '../utils/client.js'
import { isJsonMode, output } from '../utils/output.js'

export async function magnetUpload(magnetOrFile: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Uploading magnet/torrent...').start()

  try {
    let result

    if (magnetOrFile.startsWith('magnet:')) {
      result = await client.magnet.upload(magnetOrFile)
    } else {
      try {
        const fileBuffer = readFileSync(magnetOrFile)
        const file = new File([fileBuffer], magnetOrFile.split(/[\\/]/).pop() || 'torrent.torrent')
        result = await client.magnet.uploadFile(file)
      } catch {
        result = await client.magnet.upload(magnetOrFile)
      }
    }

    spinner?.succeed(chalk.green('Magnet uploaded successfully!'))

    // Handle both magnet upload and file upload responses
    if (result) {
      const items =
        'magnets' in result ? result.magnets : 'files' in result ? result.files : undefined
      if (items && items.length > 0) {
        const item = items[0]!
        output(item, () => {
          console.log(chalk.dim('\nMagnet Information:'))
          console.log(`  ID: ${chalk.cyan(item.id)}`)
          console.log(`  Name: ${chalk.cyan(item.name)}`)
          console.log(`  Hash: ${chalk.cyan(item.hash)}`)
          console.log(`  Size: ${chalk.cyan(formatBytes(item.size || 0))}`)
          console.log(`  Ready: ${item.ready ? chalk.green('Yes') : chalk.yellow('Processing')}`)
        })
      }
    }
  } catch (error: any) {
    spinner?.fail('Failed to upload magnet')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function magnetList(statusFilter?: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching magnets...').start()

  try {
    const result = await client.magnet.statusList(
      statusFilter as 'active' | 'ready' | 'expired' | 'error' | undefined,
    )

    spinner?.stop()

    if (!result?.magnets || result.magnets.length === 0) {
      output({ magnets: [] }, () => console.log(chalk.yellow('No magnets found')))
      return
    }

    output(result, () => {
      console.log(chalk.green(`\nFound ${result.magnets!.length} magnet(s):\n`))

      for (const magnet of result.magnets!) {
        const statusColor = getStatusColor(magnet.status || '')

        console.log(`${chalk.bold(`#${magnet.id}`)} - ${magnet.filename}`)
        console.log(`  Status: ${statusColor(magnet.status)}`)
        console.log(`  Size: ${formatBytes(magnet.size || 0)}`)

        if (magnet.status === 'Downloading' && magnet.downloaded !== undefined && magnet.size) {
          const progress = Math.round((magnet.downloaded / magnet.size) * 100)
          console.log(
            `  Progress: ${chalk.cyan(`${progress}%`)} (${formatBytes(magnet.downloaded)} / ${formatBytes(magnet.size)})`,
          )
          if (magnet.downloadSpeed) {
            console.log(`  Speed: ${chalk.cyan(`${formatBytes(magnet.downloadSpeed)}/s`)}`)
          }
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch magnets')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function magnetStatus(
  id?: string,
  options?: { live?: boolean; session?: number; counter?: number },
): Promise<void> {
  const client = createClient()

  // Live mode without ID - monitor all magnets
  if (options?.live && !id) {
    const session = options.session ?? Math.floor(Math.random() * 1000000)
    const counter = options.counter ?? 0

    const spinner = isJsonMode() ? null : ora('Fetching magnet status (live mode)...').start()

    try {
      const result = await client.magnet.statusLive({ session, counter })

      spinner?.stop()

      if (!result?.magnets || result.magnets.length === 0) {
        output({ magnets: [], session, counter: result?.counter ?? counter }, () => {
          console.log(chalk.yellow('No magnets found'))
          console.log(chalk.dim(`\nSession: ${session} | Counter: ${result?.counter ?? counter}`))
        })
        return
      }

      output({ ...result, session }, () => {
        console.log(
          chalk.green(
            `\nFound ${result.magnets!.length} magnet(s)${result.fullsync ? ' (full sync)' : ' (delta)'}:\n`,
          ),
        )

        for (const magnet of result.magnets!) {
          const statusColor = getStatusColor(magnet.status || '')

          console.log(`${chalk.bold(`#${magnet.id}`)} - ${magnet.filename}`)
          console.log(`  Status: ${statusColor(magnet.status)}`)
          console.log(`  Size: ${formatBytes(magnet.size || 0)}`)

          if (magnet.status === 'Downloading' && magnet.downloaded !== undefined && magnet.size) {
            const progress = Math.round((magnet.downloaded / magnet.size) * 100)
            const progressStr = `${formatBytes(magnet.downloaded)} / ${formatBytes(magnet.size)}`
            console.log(`  Progress: ${chalk.cyan(`${progress}%`)} (${progressStr})`)
            if (magnet.downloadSpeed) {
              console.log(`  Speed: ${chalk.cyan(`${formatBytes(magnet.downloadSpeed)}/s`)}`)
            }
          }

          console.log('')
        }

        console.log(chalk.dim(`Session: ${session} | Counter: ${result.counter ?? counter}`))
        console.log(
          chalk.dim(
            `Use these values for next call: --session ${session} --counter ${result.counter ?? counter}`,
          ),
        )
      })
    } catch (error: any) {
      spinner?.fail('Failed to fetch magnet status')
      console.error(
        isJsonMode()
          ? JSON.stringify({ error: error.message })
          : chalk.red(error.message || 'Unknown error'),
      )
      process.exit(1)
    }
    return
  }

  // Standard mode - single magnet status
  if (!id) {
    const msg = 'Error: Magnet ID required for standard mode'
    console.error(isJsonMode() ? JSON.stringify({ error: msg }) : chalk.red(msg))
    if (!isJsonMode()) {
      console.log(chalk.dim('Usage: adb magnet status <id>'))
      console.log(chalk.dim('   or: adb magnet status --live [--session <n>] [--counter <n>]'))
    }
    process.exit(1)
  }

  const spinner = isJsonMode() ? null : ora('Fetching magnet status...').start()

  try {
    const result = await client.magnet.status(Number.parseInt(id))

    spinner?.stop()

    if (!result?.magnets || result.magnets.length === 0) {
      output({ magnet: null }, () => console.log(chalk.yellow('Magnet not found')))
      return
    }

    const magnet = result.magnets[0]

    output(magnet, () => {
      console.log(chalk.bold(`\nMagnet #${magnet?.id}`))
      console.log(chalk.dim('─'.repeat(50)))
      console.log(`Filename: ${chalk.cyan(magnet?.filename || 'N/A')}`)
      console.log(`Status: ${getStatusColor(magnet?.status || '')(magnet?.status)}`)
      console.log(`Size: ${chalk.cyan(formatBytes(magnet?.size || 0))}`)

      if (magnet?.status === 'Downloading' && magnet.downloaded !== undefined && magnet.size) {
        const progress = Math.round((magnet.downloaded / magnet.size) * 100)
        console.log(
          `Progress: ${chalk.cyan(`${progress}%`)} (${formatBytes(magnet.downloaded)} / ${formatBytes(magnet.size)})`,
        )
        if (magnet.downloadSpeed) {
          console.log(`Speed: ${chalk.cyan(`${formatBytes(magnet.downloadSpeed)}/s`)}`)
        }
      }

      console.log('')
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch magnet status')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function magnetWatch(id: string): Promise<void> {
  const client = createClient()
  const magnetId = Number.parseInt(id)

  console.log(chalk.cyan(`Monitoring magnet #${id}...\n`))

  try {
    // Use SDK's watch function
    await client.magnet.watch(magnetId, {
      interval: 2000,
      maxAttempts: 0,
      stopOnStatus: '', // Empty string won't match any real status
      onUpdate: (status) => {
        if (!status?.magnets || !Array.isArray(status.magnets)) {
          return
        }

        // SDK normalizes the response to always return magnets as an array
        const magnet = status.magnets[0]
        if (!magnet) {
          return
        }

        // Clear line and display current status
        process.stdout.write('\r\x1B[K')

        const currentStatus = magnet.status || magnet.statusCode?.toString() || 'Processing'
        const statusStr = getStatusColor(currentStatus)(currentStatus)

        // Calculate progress
        let progress = 0
        if (magnet.status === 'Ready' || magnet.statusCode === 4) {
          progress = 100
        } else if (magnet.downloaded !== undefined && magnet.size) {
          progress = Math.round((magnet.downloaded / magnet.size) * 100)
        }

        const speed = magnet.downloadSpeed ? `${formatBytes(magnet.downloadSpeed)}/s` : 'N/A'

        process.stdout.write(
          `Status: ${statusStr} | Progress: ${chalk.cyan(`${progress}%`)} | Speed: ${chalk.cyan(speed)}`,
        )

        // Check for completion and exit
        if (magnet.status === 'Ready' || magnet.statusCode === 4) {
          console.log(chalk.green('\n\nDownload complete!'))
          process.exit(0)
        } else if (magnet.status === 'Error') {
          console.log(chalk.red('\n\nDownload failed!'))
          process.exit(1)
        }
      },
    })
  } catch (error: any) {
    console.error(chalk.red(`\n\nError: ${error.message || 'Unknown error'}`))
    process.exit(1)
  }
}

export async function magnetDelete(id: string): Promise<void> {
  const client = createClient()

  // Skip confirmation in JSON mode
  if (!isJsonMode()) {
    const shouldDelete = await clack.confirm({
      message: `Delete magnet #${id}?`,
      initialValue: false,
    })

    if (clack.isCancel(shouldDelete) || !shouldDelete) {
      clack.cancel('Deletion cancelled.')
      return
    }
  }

  const spinner = isJsonMode() ? null : ora('Deleting magnet...').start()

  try {
    await client.magnet.delete(Number.parseInt(id))
    output({ success: true, id: Number.parseInt(id) }, () => {
      spinner?.succeed(chalk.green(`Magnet #${id} deleted successfully`))
    })
  } catch (error: any) {
    spinner?.fail('Failed to delete magnet')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function magnetRestart(id: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Restarting magnet...').start()

  try {
    await client.magnet.restart(Number.parseInt(id))
    output({ success: true, id: Number.parseInt(id) }, () => {
      spinner?.succeed(chalk.green(`Magnet #${id} restarted successfully`))
    })
  } catch (error: any) {
    spinner?.fail('Failed to restart magnet')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function magnetFiles(id: string): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching download links...').start()

  try {
    const data = await client.magnet.files(Number.parseInt(id))

    spinner?.stop()

    if (!data?.magnets || data.magnets.length === 0) {
      output({ files: [] }, () => console.log(chalk.yellow('No files available yet')))
      return
    }

    output(data, () => {
      console.log(chalk.green(`\nDownload Links:\n`))

      for (const magnet of data.magnets!) {
        if (magnet.files && magnet.files.length > 0) {
          extractFiles(magnet.files, 0)
        }
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch files')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

function extractFiles(files: any[], level: number): void {
  for (const file of files) {
    const indent = '  '.repeat(level)
    if (file.l && file.l.length > 0) {
      console.log(`${indent}${chalk.bold(file.n)}`)
      file.l.forEach((link: string) => {
        console.log(`${indent}  ${chalk.blue.underline(link)}`)
      })
    }
    if (file.e && file.e.length > 0) {
      console.log(`${indent}${chalk.dim(`${file.n}/`)}`)
      extractFiles(file.e, level + 1)
    }
  }
}

export async function magnetInteractive(): Promise<void> {
  clack.intro(chalk.cyan('Magnet Management'))

  const action = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'list', label: 'List all magnets' },
      { value: 'upload', label: 'Upload new magnet/torrent' },
      { value: 'status', label: 'Check magnet status' },
      { value: 'watch', label: 'Monitor magnet progress' },
      { value: 'files', label: 'Get download links' },
      { value: 'delete', label: 'Delete magnet' },
      { value: 'restart', label: 'Restart failed magnet' },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }

  switch (action) {
    case 'list':
      await magnetList()
      break

    case 'upload': {
      const magnet = await clack.text({
        message: 'Enter magnet link or torrent file path:',
        validate: (value) => {
          if (!value) return 'Please enter a magnet link or file path'
          return undefined
        },
      })

      if (clack.isCancel(magnet)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await magnetUpload(magnet)
      break
    }

    case 'status':
    case 'watch':
    case 'files':
    case 'delete':
    case 'restart': {
      const id = await clack.text({
        message: 'Enter magnet ID:',
        validate: (value) => {
          if (!value || Number.isNaN(Number.parseInt(value))) {
            return 'Please enter a valid magnet ID'
          }
          return undefined
        },
      })

      if (clack.isCancel(id)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      if (action === 'status') await magnetStatus(id)
      else if (action === 'watch') await magnetWatch(id)
      else if (action === 'files') await magnetFiles(id)
      else if (action === 'delete') await magnetDelete(id)
      else if (action === 'restart') await magnetRestart(id)
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

function getStatusColor(status: string) {
  switch (status) {
    case 'Ready':
      return chalk.green
    case 'Downloading':
      return chalk.blue
    case 'Error':
      return chalk.red
    case 'Expired':
      return chalk.gray
    default:
      return chalk.yellow
  }
}
