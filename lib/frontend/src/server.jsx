import path from 'path'

import { routerMiddleware } from 'connected-react-router'
import { createMemoryHistory } from 'history'
import Koaze from 'koaze'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import App from './components/App'
import Root from './components/Root'
import * as config from './config'
import createRootReducer from './reducer'
import { renderHtml } from './render'

const koaze = new Koaze({
  ...config,
  faviconPath: path.resolve(__dirname, 'favicon.png'),
  staticDirs: [],
  assetsDir: config.dirs.assets,
})

koaze.router.get('/*', ctx => {
  const history = createMemoryHistory({ initialEntries: [ctx.url] })
  const reducer = createRootReducer(history)
  const store = createStore(
    reducer,
    compose(applyMiddleware(routerMiddleware(history), thunk))
  )
  const staticContext = {}

  // Render app and get side effects
  const app = renderToString(
    <Root store={store} history={history}>
      <StaticRouter location={ctx.url} context={staticContext}>
        <App />
      </StaticRouter>
    </Root>
  )
  // Get status from side effect
  ctx.status = staticContext.status || 200

  if ([301, 302].includes(staticContext.status) && staticContext.url) {
    ctx.redirect(staticContext.url)
    return
  }

  ctx.type = 'text/html'
  ctx.body = renderHtml(app, store)
})

koaze.serve(console.error.bind(console))
