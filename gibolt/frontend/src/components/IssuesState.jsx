import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import StatusItem from './StatusItem'
import { setIssuesState } from '../actions'
import { issuesStateFromState } from '../utils'
import './IssuesState.sass'


const b = block('IssuesState')

function IssuesState({issuesState, onStatusItemClick}) {
  return (
    <ul className={ b }>
      <StatusItem action="open" active={issuesState == 'open'}>
        Open
      </StatusItem>
      <StatusItem action="closed" active={issuesState == 'closed'}>
        Closed
      </StatusItem>
      <StatusItem action="all" active={issuesState == 'all'}>
        All
      </StatusItem>
    </ul>
  )
}

export default connect((state) => {
  return {issuesState: issuesStateFromState(state)}
})(IssuesState)
