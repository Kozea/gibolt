
import http from 'http'
import express from 'express'
import bodyParser from 'body-parser'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { RouterProvider, routerForExpress, initializeCurrentLocation } from 'redux-little-router'
import { Provider } from 'react-redux'
import { createStore, compose, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import thunk from 'redux-thunk'
import reducer from './reducers'
import routes from './routes'
import App from './components/App'
import url from 'url'

const server_url = url.parse(process.env.RENDER_SERVER)

var app = express()
var server = http.Server(app)

app.use('/', (req, res) => {
	const router = routerForExpress({
		routes,
		request: req
	})

	const store = createStore(
		reducer,
		compose(
			router.routerEnhancer,
			applyMiddleware(
				router.routerMiddleware,
				thunk
			)
		)
	)

  const initialLocation = store.getState().router
  if (initialLocation) {
    store.dispatch(initializeCurrentLocation(initialLocation))
  }

	res.send(renderToString(
		<Provider store={ store }>
			<RouterProvider store={ store }>
				<App />
			</RouterProvider>
		</Provider>
	))
})

server.listen(server_url.port, server_url.hostname, function() {
	console.log('React render server listening at ' + server_url.href)
})
