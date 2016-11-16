import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { RouterProvider, routerForBrowser, initializeCurrentLocation } from 'redux-little-router'
import { createStore, applyMiddleware, dispatch } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { fetchIssues, setLoading } from './actions'
import reducer from './reducers'

const logger = createLogger()
let rootNode = document.getElementById('root')

const {
  routerEnhancer,
  routerMiddleware
} = routerForBrowser({
  routes: {
    '/': 'Issues',
    '/timeline':'Timeline'
  }
})

const autoLoadMiddleware = ({ getState, dispatch }) => {
  return (next) =>
    (action) => {
      const state = getState()
      const rv = next(action)

      if (action.type == 'ROUTER_LOCATION_CHANGED') {
        if (action.payload.pathname == '/') {
          const newState = getState()
          if (state.issues.mustLoad || (
              state.router.query.priority != newState.router.query.priority) || (
                state.router.query.qualifier != newState.router.query.qualifier) ) {
            dispatch(setLoading())
            dispatch(fetchIssues())
          }
        }
      }
      return rv
    }
}

let serverState = window.__PRELOADED_STATE__ || undefined
let store = createStore(reducer, serverState, composeWithDevTools(
  routerEnhancer, applyMiddleware(routerMiddleware, autoLoadMiddleware, thunk)))

const initialLocation = store.getState().router
if (initialLocation) {
  store.dispatch(initializeCurrentLocation(initialLocation))
}

let render = () => {
  const App = require('./components/App').default
  ReactDOM.render(
    <Provider store={ store }>
      <RouterProvider store={ store }>
        <App />
      </RouterProvider>
    </Provider>,
    rootNode
  )
}

if (module.hot) {
  const renderApp = render
  const renderError = (error) => {
    const RedBox = require('redbox-react').default
    ReactDOM.render(
      <RedBox error={error} />,
      rootNode
    )
  }
  render = () => {
    try {
      renderApp()
    } catch (error) {
      renderError(error)
    }
    module.hot.accept('./components/App', () => {
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(rootNode)
        render()
      })
    })
  }
  module.hot.accept('./reducers', () => {
    store.replaceReducer(require('./reducers').default)
  })
}

render()
