import path from 'path'

import { createMemoryHistory } from 'history'
import Koaze from 'koaze'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { routerMiddleware } from 'react-router-redux'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import App from './components/App'
import Root from './components/Root'
import * as config from './config'
import reducer from './reducer'
import { renderHtml } from './render'

const koaze = new Koaze({
  ...config,
  faviconPath: path.resolve(__dirname, 'favicon.png'),
  staticDirs: [],
  assetsDir: config.dirs.assets,
})

koaze.router.get('/*', ctx => {
  const history = createMemoryHistory({ initialEntries: [ctx.url] })
  const store = createStore(
    reducer,
    compose(applyMiddleware(routerMiddleware(history), thunk))
  )

  // Render app and get side effects
  const app = renderToString(
    <Root store={store} history={history}>
      <App />
    </Root>
  )
  // Get status from side effect
  const { status } = store.getState()
  ctx.status = status.code

  if ([301, 302].includes(status.code)) {
    ctx.redirect(status.url)
    return
  }

  ctx.type = 'text/html'
  ctx.body = renderHtml(app, store)
})

koaze.serve(console.error.bind(console))
