#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC_URL = 'https://docs.alldebrid.com/swagger/alldebrid.json'
const SPEC_PATH = join(__dirname, '../src/generated/alldebrid.json')

async function downloadSpec() {
  console.log('📥 Downloading OpenAPI spec from AllDebrid...')

  try {
    const response = await fetch(SPEC_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch spec: ${response.status} ${response.statusText}`)
    }

    const spec = await response.json()

    // Ensure directory exists
    await mkdir(dirname(SPEC_PATH), { recursive: true })

    // Save spec
    await writeFile(SPEC_PATH, JSON.stringify(spec, null, 2))

    console.log('✅ OpenAPI spec downloaded successfully')
    return SPEC_PATH
  } catch (error) {
    console.error('❌ Failed to download OpenAPI spec:', error)
    process.exit(1)
  }
}

async function generateTypes() {
  console.log('🔧 Generating TypeScript types...')

  try {
    // Dynamic import of the hey-api CLI
    const { createClient } = await import('@hey-api/openapi-ts')

    await createClient({
      input: SPEC_PATH,
      output: join(__dirname, '../src/generated'),
      client: '@hey-api/client-fetch',
      types: {
        enums: 'typescript',
      },
      schemas: false,
    })

    console.log('✅ TypeScript types generated successfully')
  } catch (error) {
    console.error('❌ Failed to generate types:', error)
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Starting type generation for AllDebrid SDK\n')

  await downloadSpec()
  await generateTypes()

  console.log('\n✨ Type generation complete!')
}

main()
