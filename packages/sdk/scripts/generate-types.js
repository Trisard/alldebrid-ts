#!/usr/bin/env node
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT_SPEC_PATH = join(__dirname, '../../../spec/alldebrid-spec.json')

async function generateTypes() {
  console.log('🔧 Generating TypeScript types...')

  try {
    // Ensure output directory exists
    const outputDir = join(__dirname, '../src/generated')
    await mkdir(outputDir, { recursive: true })

    // Dynamic import of the hey-api CLI
    const { createClient } = await import('@hey-api/openapi-ts')

    await createClient({
      input: ROOT_SPEC_PATH,
      output: outputDir,
      client: '@hey-api/client-fetch',
      types: {
        enums: 'typescript',
      },
      schemas: false,
      services: false,
    })

    console.log('✅ TypeScript types generated successfully')
  } catch (error) {
    console.error('❌ Failed to generate types:', error)
    console.error('  Make sure alldebrid-spec.json exists in the spec/ folder')
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Starting type generation for AllDebrid SDK\n')

  await generateTypes()

  console.log('\n✨ Type generation complete!')
}

main()
