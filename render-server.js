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

require('./gibolt/frontend/src/server.jsx')
