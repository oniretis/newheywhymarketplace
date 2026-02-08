import { defineEventHandler } from 'h3'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineEventHandler(() => {
  const indexFile = resolve(process.cwd(), 'dist/client/index.html')
  const html = readFileSync(indexFile, 'utf-8')

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
})