import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'

export default function Root({ store, history, children }) {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>{children}</ConnectedRouter>
    </Provider>
  )
}
