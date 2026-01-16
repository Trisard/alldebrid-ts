import * as clack from '@clack/prompts'
import chalk from 'chalk'
import ora from 'ora'
import { createClient } from '../utils/client.js'
import { isJsonMode, output } from '../utils/output.js'

export async function voucherBalance(): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching voucher balance...').start()

  try {
    const balance = await client.voucher.getBalance()

    spinner?.stop()

    output(balance, () => {
      console.log(chalk.bold('\nVoucher Balance:'))
      console.log(chalk.dim('─'.repeat(50)))

      if (balance?.balance !== undefined) {
        console.log(`Balance: ${chalk.cyan(balance.balance)}`)
      }

      console.log('')
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch voucher balance')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function voucherList(quantity?: number): Promise<void> {
  const client = createClient()
  const spinner = isJsonMode() ? null : ora('Fetching vouchers...').start()

  try {
    const result = await client.voucher.getVouchers(quantity)

    spinner?.stop()

    if (!result?.codes || result.codes.length === 0) {
      output({ codes: [] }, () => console.log(chalk.yellow('No vouchers found')))
      return
    }

    output(result, () => {
      console.log(chalk.green(`\nVouchers (${result.codes!.length}):\n`))

      for (const code of result.codes!) {
        console.log(`  ${chalk.cyan(code)}`)
      }

      if (result.partialList) {
        console.log(chalk.yellow('\n(Partial list - not all vouchers available)'))
      }

      console.log('')
    })
  } catch (error: any) {
    spinner?.fail('Failed to fetch vouchers')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function voucherGenerate(quantity: number, days: number): Promise<void> {
  const client = createClient()

  // Skip confirmation in JSON mode
  if (!isJsonMode()) {
    const shouldGenerate = await clack.confirm({
      message: `Generate ${quantity} voucher(s) for ${days} days?`,
      initialValue: false,
    })

    if (clack.isCancel(shouldGenerate) || !shouldGenerate) {
      clack.cancel('Operation cancelled.')
      return
    }
  }

  const spinner = isJsonMode() ? null : ora('Generating voucher(s)...').start()

  try {
    const result = await client.voucher.generateVouchers(quantity, days)

    spinner?.succeed(chalk.green(`${quantity} voucher(s) generated successfully!`))

    output(result, () => {
      if (result?.codes && result.codes.length > 0) {
        console.log(chalk.bold('\nGenerated Voucher Codes:\n'))

        for (const code of result.codes) {
          console.log(`  ${chalk.cyan(code)}`)
        }

        if (result.pricePerVoucher !== undefined) {
          console.log(chalk.dim(`\nPrice per voucher: $${result.pricePerVoucher}`))
        }

        console.log('')
      }
    })
  } catch (error: any) {
    spinner?.fail('Failed to generate voucher(s)')
    console.error(
      isJsonMode()
        ? JSON.stringify({ error: error.message })
        : chalk.red(error.message || 'Unknown error'),
    )
    process.exit(1)
  }
}

export async function voucherInteractive(): Promise<void> {
  clack.intro(chalk.cyan('Voucher Management (Reseller)'))

  const action = await clack.select({
    message: 'What would you like to do?',
    options: [
      { value: 'balance', label: 'Check balance' },
      { value: 'list', label: 'List vouchers' },
      { value: 'generate', label: 'Generate vouchers' },
    ],
  })

  if (clack.isCancel(action)) {
    clack.cancel('Operation cancelled.')
    process.exit(0)
  }

  switch (action) {
    case 'balance':
      await voucherBalance()
      break

    case 'list': {
      const quantityInput = await clack.text({
        message: 'How many vouchers to list? (optional)',
        validate: (value) => {
          if (value && Number.isNaN(Number.parseInt(value))) {
            return 'Please enter a valid number'
          }
          return undefined
        },
      })

      if (clack.isCancel(quantityInput)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      const quantity = quantityInput ? Number.parseInt(quantityInput) : undefined
      await voucherList(quantity)
      break
    }

    case 'generate': {
      const quantityInput = await clack.text({
        message: 'How many vouchers to generate?',
        validate: (value) => {
          const num = Number.parseInt(value)
          if (Number.isNaN(num) || num <= 0) {
            return 'Please enter a valid positive number'
          }
          return undefined
        },
      })

      if (clack.isCancel(quantityInput)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      const daysInput = await clack.text({
        message: 'Duration in days?',
        validate: (value) => {
          const num = Number.parseInt(value)
          if (Number.isNaN(num) || num <= 0) {
            return 'Please enter a valid positive number'
          }
          return undefined
        },
      })

      if (clack.isCancel(daysInput)) {
        clack.cancel('Operation cancelled.')
        process.exit(0)
      }

      await voucherGenerate(Number.parseInt(quantityInput), Number.parseInt(daysInput))
      break
    }
  }
}
