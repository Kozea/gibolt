import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import StatusItem from './StatusItem'
import { setIssuesState } from '../actions'
import { issuesStateFromState } from '../utils'
import './IssuesState.sass'


const b = block('IssuesState')

function IssuesState({ issuesState, query }) {
  return (
    <ul className={ b }>
      <StatusItem action="open" type="state" query={ query } active={ issuesState == 'open' }>
        Open
      </StatusItem>
      <StatusItem action="closed" type="state" query={ query } active={ issuesState == 'closed' }>
        Closed
      </StatusItem>
      <StatusItem action="all" type="state" query={ query } active={ issuesState == 'all' }>
        All
      </StatusItem>
    </ul>
  )
}

export default connect((state) => {
  return {
    issuesState: issuesStateFromState(state),
    query: state.router.query
  }
})(IssuesState)
