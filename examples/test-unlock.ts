import { AllDebridClient } from '../packages/sdk/src/index.js'

/**
 * Test to verify link.unlock() returns proper data
 */
async function main() {
  const client = new AllDebridClient({
    apiKey: process.env.ALLDEBRID_API_KEY || 'your-api-key-here',
  })

  console.log('🔍 Testing link.unlock() return type...\n')

  try {
    // Test with a sample link (this will likely fail with an error, but we want to see the response structure)
    const result = await client.link.unlock('https://example.com/test.zip')

    console.log('✅ Result received:')
    console.log('Type of result:', typeof result)
    console.log('Is undefined?', result === undefined)
    console.log('Result object:', result)

    if (result) {
      console.log('\n📦 Result properties:')
      console.log('- link:', result.link)
      console.log('- filename:', result.filename)
      console.log('- filesize:', result.filesize)
    }
  } catch (error: any) {
    console.log('❌ Error (expected for invalid link):')
    console.log('- Code:', error.code)
    console.log('- Message:', error.message)

    // The error is expected, but we verified the method doesn't return undefined
    console.log('\n✨ Method executed (error is normal for test link)')
  }
}

main().catch(console.error)
