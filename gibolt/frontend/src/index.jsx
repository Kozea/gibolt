import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { RouterProvider, routerForBrowser, initializeCurrentLocation } from 'redux-little-router'
import { createStore, applyMiddleware, dispatch } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import { fetchResults, setLoading, setModifier } from './actions'
import routes from './routes'
import reducer from './reducers'

let rootNode = document.getElementById('root')

const {
  routerEnhancer,
  routerMiddleware
} = routerForBrowser({
  routes
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
                state.router.query.ack != newState.router.query.ack) || (
                  state.router.query.qualifier != newState.router.query.qualifier) || (
                    state.router.query.involves != newState.router.query.involves) || (
                      state.router.query.assignee != newState.router.query.assignee)) {
            dispatch(setLoading('issues'))
            dispatch(fetchResults('issues'))
          }
        } else if (action.payload.pathname == '/timeline') {
          const newState = getState()
          if (state.timeline.mustLoad || (
              state.router.query.start != newState.router.query.start) || (
                state.router.query.stop != newState.router.query.stop)) {
            dispatch(setLoading('timeline'))
            dispatch(fetchResults('timeline'))
          }
        } else if (action.payload.pathname == '/report') {
          const newState = getState()
          if (state.report.mustLoad || (
              state.router.query.start != newState.router.query.start) || (
                state.router.query.stop != newState.router.query.stop)) {
            dispatch(setLoading('report'))
            dispatch(fetchResults('report'))
          }
        } else if (action.payload.pathname == '/repositories') {
          const newState = getState()
          if (state.repositories.mustLoad) {
            dispatch(setLoading('repositories'))
            dispatch(fetchResults('repositories'))
          }
        } else if (action.payload.pathname == '/repository') {
          dispatch(setLoading('repository'))
          dispatch(fetchResults('repository'))
        }
      }
      return rv
    }
}

let serverState = window.__PRELOADED_STATE__ || undefined
let store = createStore(reducer, serverState, composeWithDevTools(
  routerEnhancer, applyMiddleware(routerMiddleware, autoLoadMiddleware, thunk)))

;['keydown', 'keyup'].map(event =>
  window.addEventListener(event, (e) => {
    switch(e.keyCode) {
      case 16:
        store.dispatch(setModifier('shift', event == 'keydown'))
        break
      case 17:
        store.dispatch(setModifier('ctrl', event == 'keydown'))
        break
      case 18:
        store.dispatch(setModifier('alt', event == 'keydown'))
        break
    }
  })
)
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
