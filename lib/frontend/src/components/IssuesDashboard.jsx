import React, { Component }  from 'react'
import { Link }  from 'redux-little-router'
import { block } from '../utils'
import Labels from './Labels'
import Status from './Status'
import Issues from './Issues'
import './IssuesDashboard.sass'


const b = block('IssuesDashboard')
export default function IssuesDashboard() {
  return (
    <div className={ b }>
      <Labels />
      <div className={ b('pane') }>
        <Status />
        <Issues />
      </div>
    </div>
  )
}
