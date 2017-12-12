import { readFileSync } from 'fs'
import path from 'path'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { Helmet } from 'react-helmet'

// eslint-disable-next-line import/extensions
import Html from './components/Html.jsx'
import * as config from './config'

const assets = {}
const getAssets = () => {
  if (Object.keys(assets).length === 0) {
    if (config.debug) {
      assets.links = []
      assets.scripts = [
        'https://polyfill.kozea.fr/polyfill.min.js',
        ...['manifest.js', 'vendor.js', 'client.js'].map(
          file => `${config.publicPath}${file}`
        ),
      ]
    } else {
      const manifest = JSON.parse(
        readFileSync(path.resolve(config.dirs.assets, 'manifest.json'), 'utf8')
      )
      assets.links = ['client.css'].map(
        file => `${config.publicPath}${manifest[file]}`
      )
      assets.scripts = [
        'https://polyfill.kozea.fr/polyfill.min.js',
        ...['manifest.js', 'vendor.js', 'client.js'].map(
          file => `${config.publicPath}${manifest[file]}`
        ),
      ]
    }
  }
  return assets
}

export const renderHtml = (app, store) =>
  `<!DOCTYPE html>${renderToString(
    <Html
      helmet={Helmet.renderStatic()}
      window={
        store && {
          __STATE__: store.getState(),
        }
      }
      links={getAssets().links}
      scripts={getAssets().scripts}
      app={app}
    />
  )}`
