import getBaseConfig from 'webpackozea'

// eslint-disable-next-line import/extensions
import { renderHtml } from './lib/frontend/src/render.jsx'
import * as config from './lib/frontend/src/config'

export default getBaseConfig(config, renderHtml)
