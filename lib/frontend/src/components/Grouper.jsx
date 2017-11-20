import { connect } from 'react-redux'
import React, { Component } from 'react'
import { block, grouperFromState } from '../utils'
import StatusItem from './StatusItem'
import { setGrouper } from '../actions'
import './Grouper.sass'

const b = block('Grouper')
function Grouper({ grouper, query }) {
  return (
    <ul className={ b }>
      <StatusItem action="nogroup" type="grouper" query={ query } active={grouper == 'nogroup'}>
        Don’t Group
      </StatusItem>
      <StatusItem action="assignee" type="grouper" query={ query } active={grouper == 'assignee'}>
        Assignee
      </StatusItem>
      <StatusItem action="milestone" type="grouper" query={ query } active={grouper == 'milestone'}>
        Milestone
      </StatusItem>
      <StatusItem action="state" type="grouper" query={ query } active={grouper == 'state'}>
        State
      </StatusItem>
      <StatusItem action="project" type="grouper" query={ query } active={grouper == 'project'}>
        Project
      </StatusItem>
    </ul>
  )
}

export default connect((state) => {
  return {
    grouper: grouperFromState(state),
    query: state.router.query
  }
})(Grouper)
