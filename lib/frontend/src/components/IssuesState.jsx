import './IssuesState.sass'

import block from 'bemboo'
import { parse } from 'query-string'
import React from 'react'

import { connect, issuesStateFromState } from '../utils'
import StatusItem from './StatusItem'

const b = block('IssuesState')

function IssuesState({ issuesState, query }) {
  return (
    <ul className={b}>
      <StatusItem
        action="open"
        type="state"
        query={query}
        active={issuesState === 'open'}
      >
        Open
      </StatusItem>
      <StatusItem
        action="closed"
        type="state"
        query={query}
        active={issuesState === 'closed'}
      >
        Closed
      </StatusItem>
      <StatusItem
        action="all"
        type="state"
        query={query}
        active={issuesState === 'all'}
      >
        All
      </StatusItem>
    </ul>
  )
}

export default connect(state => ({
  issuesState: issuesStateFromState(state),
  query: parse(state.router.location.search),
}))(IssuesState)
