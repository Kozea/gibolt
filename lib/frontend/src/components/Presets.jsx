import './Presets.sass'

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

const b = block('Presets')
function Presets({ location, user }) {
  const userPreset = PRESETS(user)
  const query = parse(location.search)
  return (
    <header className={b()}>
      <h1 className={b('title')}>Gibolt</h1>
      <nav>
        <ul className={b('nav')}>
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
          <Preset action="/timeline" active={location.pathname === '/timeline'}>
            Timeline
          </Preset>
          <Preset
            action={{
              pathname: '/',
              search: stringify(userPreset.sprint_issues),
            }}
            active={
              location.pathname === '/' &&
              equal(query, userPreset.sprint_issues)
            }
          >
            Issues
          </Preset>
          <Preset action="/report" active={location.pathname === '/report'}>
            Report
          </Preset>
          <Preset
            action="/repositories"
            active={location.pathname === '/repositories'}
          >
            Repositories
          </Preset>
          <Preset
            action="/organisation"
            active={location.pathname === '/organisation'}
          >
            Organisation
          </Preset>
        </ul>
      </nav>
    </header>
  )
}

export default connect(state => ({
  user: state.user,
}))(Presets)
