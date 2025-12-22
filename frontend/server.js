import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = Number(process.env.PORT || 4173)
const distDir = join(__dirname, 'dist')

// Static assets (cache aggressively by default)
app.use(express.static(distDir, { extensions: ['html'], maxAge: '1y', index: false }))

// SPA fallback: serve index.html for all non-file routes
app.get('*', (req, res, next) => {
  // If the path looks like a file that doesn't exist, still fall back to index.html
  const indexPath = join(distDir, 'index.html')
  fs.createReadStream(indexPath).on('error', next).pipe(res)
})

app.listen(port, () => {
  console.log(`Frontend serving from ${distDir} on port ${port}`)
})
