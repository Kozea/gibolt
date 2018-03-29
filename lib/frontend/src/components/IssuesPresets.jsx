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
  my_open_tickets: {
    state: 'open',
    grouper: 'project',
    priority: '',
    ack: '',
    assignee: login,
    involves: '',
  },
  all_my_tickets: {
    state: 'open',
    grouper: 'project',
    priority: '',
    ack: '',
    assignee: '',
    involves: login,
  },
  my_milestones: {
    state: 'all',
    grouper: 'milestone',
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
          action={{
            pathname: '/',
            search: stringify(userPreset.my_open_tickets),
          }}
          active={
            location.pathname === '/' &&
            equal(query, userPreset.my_open_tickets)
          }
        >
          My Open Tickets
        </Preset>
        <Preset
          action={{
            pathname: '/',
            search: stringify(userPreset.all_my_tickets),
          }}
          active={
            location.pathname === '/' && equal(query, userPreset.all_my_tickets)
          }
        >
          All My Tickets
        </Preset>
        <Preset
          action={{
            pathname: '/',
            search: stringify(userPreset.my_milestones),
          }}
          active={
            location.pathname === '/' && equal(query, userPreset.my_milestones)
          }
        >
          My Milestones
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
