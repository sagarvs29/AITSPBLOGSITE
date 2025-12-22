#!/usr/bin/env node
import { spawn } from 'child_process'
import { createRequire } from 'module'

// Prefer executing the JS entrypoint directly to avoid permission issues on Linux
const require = createRequire(import.meta.url)
const viteJs = require.resolve('vite/bin/vite.js')

const port = process.env.PORT || '4173'
const args = [viteJs, 'preview', '--host', '--port', String(port)]

const child = spawn(process.execPath, args, { stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 0))
