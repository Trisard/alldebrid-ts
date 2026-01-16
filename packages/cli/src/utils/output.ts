/**
 * Output utility for handling JSON vs human-readable output
 */

let jsonMode = false

export function setJsonMode(enabled: boolean): void {
  jsonMode = enabled
}

export function isJsonMode(): boolean {
  return jsonMode
}

/**
 * Output data - JSON if --json flag, otherwise use the formatter
 */
export function output<T>(data: T, formatter: (data: T) => void): void {
  if (jsonMode) {
    console.log(JSON.stringify(data, null, 2))
  } else {
    formatter(data)
  }
}

/**
 * Output success message (suppressed in JSON mode)
 */
export function success(message: string): void {
  if (!jsonMode) {
    console.log(message)
  }
}

/**
 * Output error - JSON format or human readable
 */
export function error(message: string, code?: string): void {
  if (jsonMode) {
    console.error(JSON.stringify({ error: message, code }))
  } else {
    console.error(message)
  }
}
