import './IssueCreation.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block } from '../utils'
import IssueCreationDetail from './IssueCreationDetail'
import Labels from './Labels'
// import Status from './Status'

const b = block('IssuesDashboard')

export default function IssueCreation() {
  return (
    <div className={b()}>
      <Helmet>
        <title>Gibolt - Create an issue</title>
      </Helmet>
      <Labels />
      <div className={b('pane')}>
        {/* <Status /> */}
        <IssueCreationDetail />
      </div>
    </div>
  )
}
