import { readFileSync } from 'fs'
import path from 'path'

import React from 'react'
import { renderToString } from 'react-dom/server'
import { Helmet } from 'react-helmet'

// eslint-disable-next-line import/extensions
import Html from './components/Html.jsx'
import * as config from './config'

const assets = {}
const manifest = {}
const getManifest = () => {
  if (!Object.keys(manifest).length) {
    Object.assign(
      manifest,
      JSON.parse(
        readFileSync(path.resolve(config.dirs.assets, 'manifest.json'), 'utf8')
      )
    )
  }
  return manifest
}

const getAssets = () => {
  if (!Object.keys(assets).length) {
    assets.links = []
    assets.scripts = [
      'https://polyfill.kozea.fr/polyfill.min.js' +
        '?features=es2016,es2017,default',
    ]
    const scripts = ['runtime~client.js', 'vendors~client.js', 'client.js']
    const links = config.debug ? [] : ['client.css']
    const transform = config.debug
      ? f => `${config.publicPath}${f}`
      : f => `${getManifest()[f]}`

    assets.links = [...assets.links, ...links.map(transform)]
    assets.scripts = [...assets.scripts, ...scripts.map(transform)]
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
