import { AllDebridClient } from '../packages/sdk/src/index.js'

/**
 * Basic example showing how to use the AllDebrid SDK
 */
async function main() {
  // Create client with your API key
  const client = new AllDebridClient({
    apiKey: process.env.ALLDEBRID_API_KEY || 'your-api-key-here',
  })

  console.log('🚀 AllDebrid SDK Example\n')

  // Test connection
  console.log('Testing connection...')
  const isConnected = await client.ping()
  console.log(`✅ Connection: ${isConnected ? 'OK' : 'FAILED'}\n`)

  if (!isConnected) {
    console.error('❌ Failed to connect to AllDebrid API')
    return
  }

  // Get user info
  console.log('📝 Fetching user info...')
  const user = await client.user.getInfo()
  console.log(`Username: ${user?.username}`)
  console.log(`Premium: ${user?.isPremium}`)
  console.log(`Email: ${user?.email}\n`)

  // Get supported hosts
  console.log('🌐 Fetching supported hosts...')
  const hosts = await client.host.domains()
  console.log(`Total hosts: ${hosts?.hosts?.length || 0}`)
  console.log(`Example hosts: ${hosts?.hosts?.slice(0, 5).join(', ')}\n`)

  // Example: Unlock a link (replace with a real link)
  // const unlocked = await client.link.unlock('https://example.com/file.zip')
  // console.log('Direct link:', unlocked.link)

  console.log('✨ Done!')
}

// Run example
main().catch((error) => {
  console.error('❌ Error:', error.message)
  if (error.code) {
    console.error('Error code:', error.code)
  }
  process.exit(1)
})
