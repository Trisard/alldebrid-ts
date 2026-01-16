import { AllDebridClient } from '@adbjs/sdk'
import * as clack from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { config } from '../config.js'
import { isJsonMode, output } from '../utils/output.js'

export async function authLogin(): Promise<void> {
  clack.intro(chalk.cyan('AllDebrid Authentication'))

  if (config.hasApiKey()) {
    const shouldContinue = await clack.confirm({
      message: 'You are already authenticated. Do you want to login again?',
      initialValue: false,
    })

    if (clack.isCancel(shouldContinue) || !shouldContinue) {
      clack.cancel('Authentication cancelled.')
      process.exit(0)
    }
  }

  const tempClient = new AllDebridClient({
    apiKey: '',
    agent: '@adbjs/cli',
  })

  let pinData
  try {
    const spinner = ora('Generating PIN code...').start()
    pinData = await tempClient.pin.generate()
    spinner.succeed('PIN code generated')
  } catch (error) {
    clack.log.error('Failed to generate PIN code')
    throw error
  }

  if (!pinData) {
    throw new Error('PIN generation failed')
  }

  clack.note(
    `Visit: ${chalk.blue.underline(pinData.user_url)}\nPIN Code: ${chalk.green.bold(pinData.pin)}\n\nThis PIN will expire in 10 minutes`,
    'Authorization Required',
  )

  const spinner = ora('Waiting for authorization...').start()

  try {
    const apikey = await tempClient.pin.waitForAuth(pinData.check, pinData.pin, {
      timeout: 600000,
      interval: 3000,
    })

    spinner.succeed(chalk.green('Successfully authenticated!'))

    config.setApiKey(apikey)

    clack.outro(`Authentication successful!\nAPI key saved to: ${config.getConfigPath()}`)
  } catch (error) {
    spinner.fail('Authentication failed or timed out')
    throw error
  }
}

export async function authLogout(): Promise<void> {
  if (!config.hasApiKey()) {
    console.log(chalk.yellow('You are not authenticated'))
    return
  }

  const shouldLogout = await clack.confirm({
    message: 'Are you sure you want to logout?',
    initialValue: false,
  })

  if (clack.isCancel(shouldLogout) || !shouldLogout) {
    clack.cancel('Logout cancelled.')
    process.exit(0)
  }

  config.clearApiKey()
  console.log(chalk.green('Successfully logged out'))
  console.log(chalk.dim(`Config file: ${config.getConfigPath()}`))
}

export async function authStatus(): Promise<void> {
  const apiKey = config.getApiKey()

  if (!apiKey) {
    output({ authenticated: false }, () => {
      console.log(chalk.yellow('Not authenticated'))
      console.log(chalk.dim('\nRun "adb auth login" to authenticate'))
    })
    return
  }

  try {
    const client = new AllDebridClient({ apiKey, agent: '@adbjs/cli' })
    const spinner = isJsonMode() ? null : ora('Verifying API key...').start()

    const data = await client.user.getInfo()

    spinner?.succeed('API key is valid')

    output({ authenticated: true, valid: true, user: data?.user }, () => {
      console.log(chalk.green('Authenticated'))

      if (data?.user) {
        const userInfo = data.user
        console.log(chalk.dim('\nUser Information:'))
        console.log(`  Username: ${chalk.cyan(userInfo.username || 'N/A')}`)
        console.log(`  Premium: ${userInfo.isPremium ? chalk.green('Yes') : chalk.red('No')}`)
        if (userInfo.premiumUntil) {
          const expiryDate = new Date(userInfo.premiumUntil * 1000)
          console.log(`  Premium Until: ${chalk.cyan(expiryDate.toLocaleDateString())}`)
        }
      }
      console.log(chalk.dim(`\nConfig: ${config.getConfigPath()}`))
    })
  } catch {
    output({ authenticated: true, valid: false }, () => {
      console.log(chalk.red('\nAPI key is invalid or expired'))
      console.log(chalk.dim('Run "adb auth login" to re-authenticate'))
    })
  }
}

export async function authInteractive(): Promise<void> {
  clack.intro(chalk.cyan('Authentication Menu'))

  const action = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'login', label: 'Login (Generate new API key)' },
      { value: 'status', label: 'Check authentication status' },
      { value: 'logout', label: 'Logout (Clear saved API key)' },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }

  switch (action) {
    case 'login':
      await authLogin()
      break
    case 'status':
      await authStatus()
      break
    case 'logout':
      await authLogout()
      break
  }
}
