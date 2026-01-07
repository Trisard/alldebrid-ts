import type {
  GenerateVouchersResponse,
  GetAvailableVouchersResponse,
  GetVoucherBalanceResponse,
} from '../generated/types.gen.js'
import { BaseResource } from '../base-resource.js'

/**
 * Voucher resource for reseller voucher management
 *
 * Note: These endpoints are only available for reseller accounts.
 */
export class VoucherResource extends BaseResource {
  /**
   * Get voucher balance for reseller accounts
   *
   * This endpoint allows resellers to check their remaining voucher balance.
   * Only available for accounts with reseller privileges.
   *
   * @example
   * ```ts
   * const balance = await client.voucher.getBalance()
   * console.log('Remaining balance:', balance.balance, '€')
   * ```
   *
   * @returns Voucher balance information
   */
  async getBalance() {
    return this.get<GetVoucherBalanceResponse>('/voucher/balance')
  }

  /**
   * Retrieve existing vouchers from reseller inventory
   *
   * This endpoint retrieves vouchers that were previously generated
   * and are available in your inventory.
   *
   * @param quantity - Optional number of vouchers to retrieve
   *
   * @example
   * ```ts
   * // Get all available vouchers
   * const allVouchers = await client.voucher.getVouchers()
   * console.log('Vouchers:', allVouchers?.codes)
   *
   * // Get specific quantity
   * const fiveVouchers = await client.voucher.getVouchers(5)
   * ```
   *
   * @returns List of voucher codes
   */
  async getVouchers(quantity?: number) {
    const params = quantity ? { quantity } : undefined
    return this.get<GetAvailableVouchersResponse>('/voucher/get', params)
  }

  /**
   * Generate new vouchers (deducts from reseller balance)
   *
   * This endpoint creates new vouchers and deducts the cost from your
   * reseller account balance.
   *
   * @param quantity - Number of vouchers to generate
   * @param duration - Voucher duration in days
   *
   * @example
   * ```ts
   * // Generate 10 vouchers valid for 30 days
   * const vouchers = await client.voucher.generateVouchers(10, 30)
   * console.log('Generated vouchers:', vouchers?.codes)
   *
   * // Generate 5 vouchers valid for 7 days
   * const weekVouchers = await client.voucher.generateVouchers(5, 7)
   * ```
   *
   * @returns List of newly generated voucher codes
   */
  async generateVouchers(quantity: number, duration: number) {
    return this.post<GenerateVouchersResponse>('/voucher/generate', {
      quantity,
      duration,
    })
  }
}
