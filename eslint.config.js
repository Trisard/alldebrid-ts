import antfu from '@antfu/eslint-config'

/** @type {ReturnType<typeof antfu>} */
const config = antfu(
  {
    // Type-aware rules pour TypeScript
    typescript: {
      tsconfigPath: 'tsconfig.json',
    },

    // Formatage désactivé (on utilise Prettier séparément pour éviter les problèmes TTY)
    formatters: false,

    // Ignore les fichiers générés et docs
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/.pnpm-store/**',
      '**/generated/**',
      '*.gen.ts',
      '**/*.md/**', // Ignore code blocks dans markdown
    ],
  },

  // Règles custom adaptées pour un SDK
  {
    rules: {
      // TypeScript - Plus permissif pour le SDK
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Nécessaire pour certains patterns
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'ts/strict-boolean-expressions': 'off', // Trop strict

      // Code quality
      'no-console': 'off', // OK dans examples et scripts
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unmodified-loop-condition': 'off', // False positives

      // Style - Désactivé, géré par Prettier
      curly: 'off',
      'brace-style': 'off',
      'style/arrow-parens': 'off',
      'style/brace-style': 'off',
      'style/indent': 'off', // Géré par Prettier
      'style/operator-linebreak': 'off', // Géré par Prettier
      'style/quote-props': 'off', // Géré par Prettier
      'ts/no-unsafe-call': 'off',

      // JSON sorting - Trop strict
      'jsonc/sort-keys': 'off',

      // Node.js
      'node/prefer-global/process': 'off', // process.env est OK

      // Unicorn
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
    },
  },
)

export default config
