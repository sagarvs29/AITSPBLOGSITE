#!/usr/bin/env node
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const port = process.env.PORT || '4173'
const args = ['preview', '--host', '--port', String(port)]

// Use vite from local node_modules
const isWin = process.platform === 'win32'
const viteBin = isWin ? './node_modules/.bin/vite.cmd' : './node_modules/.bin/vite'

const child = spawn(viteBin, args, { stdio: 'inherit', shell: isWin })
child.on('exit', (code) => process.exit(code ?? 0))
