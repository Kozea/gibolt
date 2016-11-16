import React, { Component } from 'react'
import { connect } from 'react-redux'
import { block } from '../utils'
import Preset from './Preset'
import equal from 'deep-equal'
import { setPreset, fetchIssues } from '../actions'
import './Presets.sass'

const PRESETS = {
  my_sprint: {
    state: 'all',
    grouper: 'state',
    priority: 'sprint'

  },
  my_tickets: {
    state: 'open',
    grouper: 'project',
    priority: ''
  },
  sprint_issues: {
    state: 'all',
    grouper: 'nogroup',
    priority: 'sprint'
  }
}

const b = block('Presets')
function Presets({ pathname, query }) {
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <Preset action={{ pathname: '/', query: PRESETS.my_sprint }}
                  active={ pathname == '/' && equal(query, PRESETS.my_sprint) }>
            My Sprint
          </Preset>
            <Preset action={{ pathname: '/', query: PRESETS.my_tickets }}
                    active={ pathname == '/' && equal(query, PRESETS.my_tickets) }>

            My Tickets
          </Preset>
          <Preset action="/timeline" active={pathname == '/timeline'}>
            Timeline
          </Preset>
            <Preset action={{ pathname: '/', query: PRESETS.sprint_issues }}
                    active={ pathname == '/' && equal(query, PRESETS.sprint_issues) }>
            Issues
          </Preset>
          <Preset action="show_assigned_issues">
            Report
          </Preset>
          <Preset action="repositories">
            Repositories
          </Preset>
        </ul>
      </nav>
    </header>
  )
}

export default connect((state) => {
  return {
    query: state.router.query,
    pathname: state.router.pathname
  }
})(Presets)
