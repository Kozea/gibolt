import fs from 'fs'
import path from 'path'
import { PassThrough } from 'stream'
import { promisify } from 'util'

import fetch from 'isomorphic-fetch'
import Koaze from 'koaze'
import React from 'react'
import { renderToNodeStream } from 'react-dom/server'

import App from './components/App'
import * as config from './config'
import Root from './Root'
import { staticStoreAndHistory } from './utils'

const koaze = new Koaze({
  ...config,
  faviconPath: path.resolve(__dirname, 'favicon.png'),
  staticDirs: [],
  assetsDir: config.dirs.assets,
})

const readIndex = async () => {
  if (config.debug) {
    const response = await fetch(
      `${config.assetsUrl.href.replace(/\/$/, '')}${
        config.publicPath
      }index.html`
    )
    return response.text()
  }
  return promisify(fs.readFile)(
    path.resolve(config.dirs.assets, 'index.html'),
    'utf-8'
  )
}

koaze.router.get('/*', async ctx => {
  const htmlStream = new PassThrough()
  const index = await readIndex()
  const [head, footer] = index.split('<!--REPLACEME-->')
  htmlStream.write(head)
  const { store, history } = staticStoreAndHistory(ctx.url)
  const stream = renderToNodeStream(
    <Root store={store} history={history}>
      <App />
    </Root>
  )
  stream.pipe(htmlStream, { end: false })
  stream.on('end', () => {
    htmlStream.write(footer)
    htmlStream.end()
  })
  ctx.type = 'text/html'
  ctx.body = htmlStream
})

koaze.serve(console.error.bind(console))
