#!/usr/bin/env node

import { Command } from 'commander'
import { authInteractive, authLogin, authLogout, authStatus } from './commands/auth.js'
import { hostDomains, hostList } from './commands/host.js'
import {
  linkInfo,
  linkInteractive,
  linkRedirector,
  linkStream,
  linkUnlock,
} from './commands/link.js'
import {
  magnetDelete,
  magnetFiles,
  magnetInteractive,
  magnetList,
  magnetRestart,
  magnetStatus,
  magnetUpload,
  magnetWatch,
} from './commands/magnet.js'
import {
  userHistory,
  userHistoryClear,
  userInfo,
  userInteractive,
  userSavedAdd,
  userSavedDelete,
  userSavedList,
} from './commands/user.js'
import {
  voucherBalance,
  voucherGenerate,
  voucherInteractive,
  voucherList,
} from './commands/voucher.js'
import { setJsonMode } from './utils/output.js'

const VERSION = '1.1.0'

const program = new Command()

program
  .name('adb')
  .description('AllDebrid CLI - Manage your AllDebrid account from the terminal')
  .version(VERSION)
  .option('--api-key <key>', 'AllDebrid API key (overrides config file)')
  .option('--json', 'Output results in JSON format')
  .hook('preAction', (thisCommand) => {
    const opts = thisCommand.optsWithGlobals()
    if (opts.json) {
      setJsonMode(true)
    }
  })

// Auth command
const auth = program.command('auth').description('Manage authentication').action(authInteractive)

auth.command('login').description('Login with PIN authentication').action(authLogin)

auth.command('logout').description('Logout and clear saved API key').action(authLogout)

auth.command('status').description('Check authentication status').action(authStatus)

// Magnet command
const magnet = program
  .command('magnet')
  .description('Manage magnets and torrents')
  .action(magnetInteractive)

magnet
  .command('upload <magnet-or-file>')
  .description('Upload magnet link or torrent file')
  .action(magnetUpload)

magnet
  .command('list')
  .description('List all magnets')
  .option('-s, --status <status>', 'Filter by status (active|ready|expired|error)')
  .action(async (options) => magnetList(options.status))

magnet
  .command('status [id]')
  .description('Get magnet status by ID, or all magnets with --live')
  .option('-l, --live', 'Use live mode (delta sync) for monitoring all magnets')
  .option('-s, --session <number>', 'Session ID for live mode (auto-generated if not provided)')
  .option('-c, --counter <number>', 'Counter for live mode synchronization')
  .action(async (id, options) => {
    const opts = {
      live: options.live,
      session: options.session ? Number.parseInt(options.session) : undefined,
      counter: options.counter ? Number.parseInt(options.counter) : undefined,
    }
    await magnetStatus(id, opts)
  })

magnet
  .command('watch <id>')
  .description('Monitor magnet progress in real-time')
  .action(async (id) => magnetWatch(id))

magnet.command('files <id>').description('Get download links for magnet').action(magnetFiles)

magnet.command('delete <id>').description('Delete magnet').action(magnetDelete)

magnet.command('restart <id>').description('Restart failed magnet').action(magnetRestart)

// Link command
const link = program.command('link').description('Manage premium links').action(linkInteractive)

link
  .command('unlock <url>')
  .description('Unlock premium link')
  .option('-p, --password <password>', 'Password for protected link')
  .action(async (url, options) => linkUnlock(url, options.password))

link
  .command('info <url>')
  .description('Get link information')
  .option('-p, --password <password>', 'Password for protected link')
  .action(async (url, options) => linkInfo(url, options.password))

link
  .command('stream <id> <stream>')
  .description('Get streaming link (e.g., "original", "1080p")')
  .action(linkStream)

link.command('redirector <url>').description('Extract links from redirector').action(linkRedirector)

// User command
const user = program.command('user').description('User account management').action(userInteractive)

user.command('info').description('View account information').action(userInfo)

user.command('saved-list').description('List saved links').action(userSavedList)

user.command('saved-add <url>').description('Save a link').action(userSavedAdd)

user.command('saved-delete <link>').description('Delete a saved link').action(userSavedDelete)

user.command('history').description('View download history').action(userHistory)

user.command('history-clear').description('Clear download history').action(userHistoryClear)

// Host command
const host = program
  .command('host')
  .description('List supported hosts')
  .action(async () => hostList(false))

host
  .command('list')
  .description('List all supported hosts with status')
  .option('--hosts-only', 'Show only host names')
  .action(async (options) => hostList(options.hostsOnly))

host.command('domains').description('List all supported domains').action(hostDomains)

// Voucher command (reseller only)
const voucher = program
  .command('voucher')
  .description('Manage vouchers (reseller accounts only)')
  .action(voucherInteractive)

voucher.command('balance').description('Check voucher balance').action(voucherBalance)

voucher
  .command('list')
  .description('List vouchers')
  .option('-q, --quantity <n>', 'Number of vouchers to list')
  .action(async (options) =>
    voucherList(options.quantity ? Number.parseInt(options.quantity) : undefined),
  )

voucher
  .command('generate <quantity> <days>')
  .description('Generate vouchers')
  .action(async (quantity, days) =>
    voucherGenerate(Number.parseInt(quantity), Number.parseInt(days)),
  )

program.parse()
