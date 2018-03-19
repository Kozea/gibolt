import path from 'path'
import url from 'url'

export const cwd = path.resolve(__dirname, '..', '..', '..')
export const debug = process.env.NODE_ENV !== 'production'
export const server = process.env.WEBPACK_ENV === 'server'
export const verbose = !!process.env.VERBOSE
export const inspect = !!process.env.INSPECT
export const staging = !!process.env.STAGING
export const http2 = !!process.env.USE_HTTP2
export const socket = process.env.SOCKET
export const protocol = http2 ? 'https://' : 'http://'
export const serverUrl = url.parse(protocol + process.env.SERVER)
export const assetsUrl = url.parse(protocol + process.env.ASSETS_SERVER)
export const apiUrl = url.parse(`http://${process.env.API_SERVER}`)
export const publicPath = '/assets/'
export const dirs = {
  assets: path.resolve(cwd, 'lib', 'frontend', 'assets'),
  src: path.resolve(cwd, 'lib', 'frontend', 'src'),
  static: process.env.STATIC || path.resolve(cwd, 'lib', 'frontend', 'static'),
  styles: path.resolve(cwd, 'lib', 'frontend', 'src', 'styles'),
  dist: path.resolve(cwd, 'dist'),
  modules: path.resolve(cwd, 'node_modules'),
}

export const mockNginx = !!process.env.MOCK_NGINX
export const forcePolyfill = !!process.env.FORCE_POLYFILL
export const timeout = 2500
