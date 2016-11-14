import { connect } from 'react-redux'
import React, { Component } from 'react'
import { block } from '../utils'
import StatusItem from './StatusItem'
import { setGrouper } from '../actions'
import './Grouper.sass'

const b = block('Grouper')
function Grouper({grouper, onStatusItemClick}) {
  return (
    <ul className={ b }>
      <StatusItem action="nogroup" active={grouper == 'nogroup'} onLinkClick={() => onStatusItemClick('nogroup')}>
        Don’t Group
      </StatusItem>
      <StatusItem action="assignee" active={grouper == 'assignee'} onLinkClick={() => onStatusItemClick('assignee')}>
        Assignee
      </StatusItem>
      <StatusItem action="milestone" active={grouper == 'milestone'} onLinkClick={() => onStatusItemClick('milestone')}>
        Milestone
      </StatusItem>
      <StatusItem action="state" active={grouper == 'state'} onLinkClick={() => onStatusItemClick('state')}>
        State
      </StatusItem>
      <StatusItem action="project" active={grouper == 'project'} onLinkClick={() => onStatusItemClick('project')}>
        Project
      </StatusItem>
    </ul>
  )
}

export default connect((state) => {
  return {grouper: state.grouper}
}, (dispatch) => {
  return {
    onStatusItemClick: (grouper) => {
      dispatch(setGrouper(grouper))
    }
  }
})(Grouper)
