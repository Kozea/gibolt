import './IssuesDashboard.sass'

import React from 'react'

import { block } from '../utils'
import Issues from './Issues'
import Labels from './Labels'
import Status from './Status'

const b = block('IssuesDashboard')

export default function IssuesDashboard() {
  return (
    <div className={b()}>
      <Labels />
      <div className={b('pane')}>
        <Status />
        <Issues />
      </div>
    </div>
  )
}
