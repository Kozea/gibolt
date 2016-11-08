var http = require('http')
var express = require('express')
var bodyParser = require('body-parser')
var React = require('react')
var ReactDOMServer = require('react-dom/server')
var reactRedux = require('react-redux')
var redux = require('redux')
var createLogger = require('redux-logger')
var thunk = require('redux-thunk')
var url = require('url')

// Ensure support for loading files that contain ES6+7 & JSX
require('babel-register')({
	plugins: [
		[
			'babel-plugin-transform-require-ignore',
			{
				extensions: ['.sass']
			}
		]
	]
})
server_url = url.parse(process.env.RENDER_SERVER)

var app = express()
var server = http.Server(app)

app.use(bodyParser.json())

app.get('/', function(req, res) {
	res.end('React render server')
})

app.post('/render', function(req, res) {
	var opts = req.body
	var Component = require(opts.path).default
	var reducer = require(opts.reducer).default

	var store = redux.createStore(
		reducer, opts.state ? JSON.parse(opts.state) : undefined,
		redux.applyMiddleware(thunk.default, createLogger()))

	res.json({
		markup: ReactDOMServer.renderToString(React.createElement(
			reactRedux.Provider,
			{store: store},
			React.createElement(Component, null))
		)
	})
})

server.listen(server_url.port, server_url.hostname, function() {
	console.log('React render server listening at ' + server_url.href)
})
