// const fs = require('fs')
// const path = require('path')

const packageManager = process.env.npm_execpath

if (packageManager && !packageManager.includes('pnpm')) {
  console.error('Only pnpm is allowed for package management. Please use pnpm.')
  process.exit(1)
}
