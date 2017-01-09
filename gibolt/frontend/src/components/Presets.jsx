import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Preset from './Preset'
import equal from 'deep-equal'
import { setPreset } from '../actions'
import './Presets.sass'

const PRESETS = (user) => ({
  urgent: {
    state: 'all',
    grouper: 'state',
    priority: 'Urgent',
    ack: '',
    assignee: user
  },
  my_tickets: {
    state: 'open',
    grouper: 'project',
    priority: '',
    ack: '',
    assignee: '',
    involves: user
  },
  sprint_issues: {
    state: 'all',
    grouper: 'nogroup',
    priority: 'sprint',
    ack: '',
    assignee: ''
  }
})

const b = block('Presets')
function Presets({ pathname, query, user }) {
  let userPreset = PRESETS(user)
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <Preset action={{ pathname: '/', query: userPreset.urgent }}
                  active={ pathname == '/' && equal({...userPreset.urgent, ...query}, userPreset.urgent) }>
            My urgency
          </Preset>
            <Preset action={{ pathname: '/', query: userPreset.my_tickets }}
                    active={ pathname == '/' && equal(query, userPreset.my_tickets) }>

            My Tickets
          </Preset>
          <Preset action="/timeline" active={ pathname == '/timeline' }>
            Timeline
          </Preset>
            <Preset action={{ pathname: '/', query: userPreset.sprint_issues }}
                    active={ pathname == '/' && equal(query, userPreset.sprint_issues) }>
            Issues
          </Preset>
          <Preset action="/report" active={pathname == '/report'}>
            Report
          </Preset>
          <Preset action="/repositories" active={pathname == '/repositories'}>
            Repositories
          </Preset>
        </ul>
      </nav>
    </header>
  )
}

export default connect(state => {
  return {
    query: state.router.query,
    user: state.user,
    pathname: state.router.pathname
  }
})(Presets)
