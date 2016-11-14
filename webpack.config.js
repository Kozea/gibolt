// Imports
var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

// Getting static server bind from environment
var staticServer = process.env.STATIC_SERVER || 'http://localhost:8000';
var [bind, port] = staticServer.split('//')[1].split(':');

// Check production status
// Production is used when building
var DEBUG = process.env.NODE_ENV !== 'production';

var publicPath = (DEBUG ? staticServer : '') + '/static/';

// Exporting setting for webpack
module.exports = {
  // Not really sure but seems the fast way
  devtool: DEBUG ? 'eval-source-map' : 'cheap-module-source-map',

  // Application entry points
  entry: (DEBUG ? [    // These defines hooks for hot reloading
      'react-hot-loader/patch',
      'webpack-dev-server/client?' + staticServer,
      'webpack/hot/only-dev-server',
    ] : []).concat([
    // This is the entry point
    './gibolt/frontend/src/index.jsx'
  ]),

  // Defines the output file for the html script tag
  output: {
    path: path.join(__dirname, 'gibolt/frontend/static'),
    filename: 'bundle.js',
    publicPath: publicPath
  },

  resolve: {
    extensions: ['.js', '.jsx']
  },
  // Entry points list, allow to load a file with transforms
  module: {
    loaders: [
      {
        // js files are loaded through babel (see .babelrc)
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: path.join(__dirname, 'gibolt', 'frontend', 'src')
      }, {
        test: /\.sass$/i,
        loaders: DEBUG ?
          ['style', 'css?sourceMap', 'sass?indentedSyntax&sourceMap']
          : ExtractTextPlugin.extract({
                fallbackLoader: 'style-loader',
                loader: ['css-loader', 'sass-loader']
            })
      }, {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader'
      }
    ]
  },

  // Options for the webpack-dev-server
  devServer: {
    publicPath: publicPath,
    hot: true,
    noInfo: true,
    historyApiFallback: true,
    bind: bind,
    port: port,
    stats: {colors: true},
    watchOptions: {
      ignored: /node_modules/
    },
  },

  // Webpack plugin list
  plugins: DEBUG ?
    [
      // Allow hot module replacement
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ] : [
      new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
      new webpack.NamedModulesPlugin(),
      new ExtractTextPlugin({filename: 'style.css'}),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {screw_ie8: true, keep_fnames: true, warnings: false},
        mangle: {screw_ie8: true, keep_fnames: true}
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.AggressiveMergingPlugin(),
    ]
};
