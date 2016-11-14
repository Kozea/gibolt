import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware, dispatch } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import { fetchIssues } from './actions'
import reducer from './reducers'
import App from './components/App'

const logger = createLogger()
let rootNode = document.getElementById('root')
let serverState = window.__PRELOADED_STATE__ || undefined
let store = createStore(reducer, serverState, composeWithDevTools(
  applyMiddleware(thunk)))


let render = () => {
  const App = require('./components/App').default
  ReactDOM.render(
    <Provider store={store}>
      <App dispatchFirstLoad={ () => {
          store.getState().issues.mustLoad && store.dispatch(fetchIssues())
      } }/>
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

export default store
