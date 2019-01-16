import './Grouper.sass'

import block from 'bemboo'
import React from 'react'

import { connect, grouperFromState } from '../utils'
import { parse } from '../utils/querystring'
import StatusItem from './StatusItem'

const b = block('Grouper')

function Grouper({ grouper, query }) {
  return (
    <ul className={b}>
      <StatusItem
        action="nogroup"
        type="grouper"
        query={query}
        active={grouper === 'nogroup'}
      >
        Don’t Group
      </StatusItem>
      <StatusItem
        action="assignee"
        type="grouper"
        query={query}
        active={grouper === 'assignee'}
      >
        Assignee
      </StatusItem>
      <StatusItem
        action="milestone"
        type="grouper"
        query={query}
        active={grouper === 'milestone'}
      >
        Milestone
      </StatusItem>
      <StatusItem
        action="state"
        type="grouper"
        query={query}
        active={grouper === 'state'}
      >
        State
      </StatusItem>
      <StatusItem
        action="project"
        type="grouper"
        query={query}
        active={grouper === 'project'}
      >
        Project
      </StatusItem>
    </ul>
  )
}

export default connect(state => ({
  grouper: grouperFromState(state),
  query: parse(state.router.location.search),
}))(Grouper)
