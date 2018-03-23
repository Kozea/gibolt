import getBaseConfig from 'webpackozea'

import * as config from './lib/frontend/src/config'
// eslint-disable-next-line import/extensions
import { renderHtml } from './lib/frontend/src/render.jsx'

export default getBaseConfig(config, renderHtml)
