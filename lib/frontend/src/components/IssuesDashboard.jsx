import './IssuesDashboard.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block } from '../utils'
import Issues from './Issues'
import Labels from './Labels'
import Status from './Status'

const b = block('IssuesDashboard')

export default function IssuesDashboard() {
  return (
    <div className={b()}>
      <Helmet>
        <title>Gibolt - Issues</title>
      </Helmet>
      <Labels />
      <div className={b('pane')}>
        <Status />
        <Issues />
      </div>
    </div>
  )
}
