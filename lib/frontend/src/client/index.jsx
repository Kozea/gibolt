import { createBrowserHistory } from 'history'
import React from 'react'
import { hydrate, render } from 'react-dom'
import { routerMiddleware } from 'react-router-redux'
import RedBox from 'redbox-react'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import { setModifier, setUser } from '../actions'
import App from '../components/App'
import Root from '../components/Root'
import reducer from '../reducer'
import autoLoadMiddleware from './autoLoadMiddleware'

export const rootNode = document.getElementById('root')

export const history = createBrowserHistory()

export const store = createStore(
  reducer,
  window.__STATE__, // Server state
  (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
    applyMiddleware(routerMiddleware(history), thunk, autoLoadMiddleware)
  )
)
;['keydown', 'keyup'].map(event =>
  window.addEventListener(event, e => {
    switch (e.keyCode) {
      case 16:
        store.dispatch(setModifier('shift', event === 'keydown'))
        break
      case 17:
        store.dispatch(setModifier('ctrl', event === 'keydown'))
        break
      case 18:
        store.dispatch(setModifier('alt', event === 'keydown'))
        break
    }
  })
)

const renderRoot = async handleError => {
  if (
    location.pathname === '/oauth_error' ||
    location.pathname === '/callback'
  ) {
    return
  }
  const response = await fetch('/api/user', { credentials: 'same-origin' })
  if (response.status === 200) {
    const { user } = await response.json()
    store.dispatch(setUser(user))
  } else {
    location.href = '/api/login'
  }
  try {
    // We render on dev server because there is no SSR
    const renderMode =
      process.env.NODE_ENV === 'development' && !window.__STATE__
        ? render
        : hydrate
    renderMode(
      <Root store={store} history={history}>
        <App />
      </Root>,
      rootNode
    )
  } catch (error) {
    handleError(error)
  }
}

/*
██████  ██████   ██████  ██████
██   ██ ██   ██ ██    ██ ██   ██
██████  ██████  ██    ██ ██   ██
██      ██   ██ ██    ██ ██   ██
██      ██   ██  ██████  ██████
*/

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console && console.log('PRODUCTION MODE')
  renderRoot(console.error)
}

/*
███████ ████████  █████   ██████  ██ ███    ██  ██████
██         ██    ██   ██ ██       ██ ████   ██ ██
███████    ██    ███████ ██   ███ ██ ██ ██  ██ ██   ███
     ██    ██    ██   ██ ██    ██ ██ ██  ██ ██ ██    ██
███████    ██    ██   ██  ██████  ██ ██   ████  ██████
*/

if (process.env.STAGING) {
  // eslint-disable-next-line no-console
  console && console.log('STAGING MODE')
  const handleError = error => render(<RedBox error={error} />, rootNode)

  renderRoot(handleError)
  window._debug = { store, reducer, history, rootNode }
}

/*
██████  ███████ ██████  ██    ██  ██████
██   ██ ██      ██   ██ ██    ██ ██
██   ██ █████   ██████  ██    ██ ██   ███
██   ██ ██      ██   ██ ██    ██ ██    ██
██████  ███████ ██████   ██████   ██████
*/

if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console && console.log('DEVELOPMENT MODE')
  const handleError = error => render(<RedBox error={error} />, rootNode)
  renderRoot(handleError)

  if (module.hot) {
    module.hot.accept('../components/App', () => renderRoot(handleError))
    module.hot.accept('../reducer', () => {
      store.replaceReducer(reducer)
    })
  }
  window._debug = { store, reducer, history, rootNode }
}
