import compression from 'compression'
import express from 'express'
import morgan from 'morgan'

// Short-circuit the type-checking of the built output.
const BUILD_PATH = './build/server/index.js'
const DEVELOPMENT = process.env.NODE_ENV === 'development'
const PORT = Number.parseInt(process.env.PORT || '3000')

const app = express()

app.use(compression())
app.disable('x-powered-by')

// Chrome DevTools（または React DevTools）による自動アクセスが原因で
// 以下のようなエラーが発生するので、.well-known へのアクセスを204で応答して無視する。
// Error: No route matches URL "/.well-known/appspecific/com.chrome.devtools.json"。
app.use('/.well-known', (req, res) => {
  res.status(204).end()
})

if (DEVELOPMENT) {
  console.log('Starting development server')
  const viteDevServer = await import('vite').then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    }),
  )
  app.use(viteDevServer.middlewares)
  app.use(async (req, res, next) => {
    try {
      const source = await viteDevServer.ssrLoadModule('./server/app.ts')
      return await source.app(req, res, next)
    } catch (error) {
      if (typeof error === 'object' && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error)
      }
      next(error)
    }
  })
} else {
  console.log('Starting production server')
  app.use(
    '/assets',
    express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
  )
  app.use(morgan('tiny'))
  app.use(express.static('build/client', { maxAge: '1h' }))
  app.use(await import(BUILD_PATH).then((mod) => mod.app))
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
