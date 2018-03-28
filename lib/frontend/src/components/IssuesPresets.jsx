import './IssuesPresets.sass'

import equal from 'deep-equal'
import { parse, stringify } from 'query-string'
import React from 'react'

import { block, connect } from '../utils'
import Preset from './Preset'

const PRESETS = ({ login }) => ({
  urgent: {
    state: 'all',
    grouper: 'state',
    priority: 'Urgent',
    ack: '',
    assignee: login,
  },
  my_tickets: {
    state: 'open',
    grouper: 'project',
    priority: '',
    ack: '',
    assignee: '',
    involves: login,
  },
  sprint_issues: {
    state: 'all',
    grouper: 'nogroup',
    priority: 'sprint',
    ack: '',
    assignee: '',
  },
})

const b = block('IssuesPresets')
function IssuesPresets({ location, user }) {
  const userPreset = PRESETS(user)
  const query = parse(location.search)
  return (
    <span className={b()}>
      <ul>
        <Preset
          action={{ pathname: '/', search: stringify(userPreset.urgent) }}
          active={
            location.pathname === '/' &&
            equal({ ...userPreset.urgent, ...query }, userPreset.urgent)
          }
        >
          My urgency
        </Preset>
        <Preset
          action={{ pathname: '/', search: stringify(userPreset.my_tickets) }}
          active={
            location.pathname === '/' && equal(query, userPreset.my_tickets)
          }
        >
          My Tickets
        </Preset>
        <Preset
          action={{
            pathname: '/',
            search: stringify(userPreset.sprint_issues),
          }}
          active={
            location.pathname === '/' && equal(query, userPreset.sprint_issues)
          }
        >
          No presets
        </Preset>
      </ul>
    </span>
  )
}

export default connect(state => ({
  user: state.user,
}))(IssuesPresets)
