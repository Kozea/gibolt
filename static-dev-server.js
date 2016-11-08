var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')

new WebpackDevServer(webpack(config), config.devServer)
  .listen(config.devServer.port, config.devServer.bind, function (err, result) {
  if (err) {
    return console.log(err)
  }

  console.log(`Webpack dev static server listening at http://${
    config.devServer.bind}:${config.devServer.port}/`)
})
