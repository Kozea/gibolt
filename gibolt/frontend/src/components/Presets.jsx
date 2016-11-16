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
    labels: ['sprint']
  },
  my_tickets: {
    state: 'open',
    grouper: 'project',
    labels: []
  },
  sprint_issues: {
    state: 'all',
    grouper: 'nogroup',
    labels: ['sprint']
  }
}

const presetLink = (pathname, query, preset) => {
  return {
      pathname: '/',
      query: {
        ...query,
        ...PRESETS.my_sprint
      }
    }
}


const b = block('Presets')
function Presets({ pathname, query }) {
  let pathquery = { pathname, query }
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <Preset action={ presetLink('/', query, PRESETS.my_sprint) }
                  active={ equal(pathquery, presetLink('/', query, PRESETS.my_sprint)) }>
            My Sprint
          </Preset>
            <Preset action={ presetLink('/', query, PRESETS.my_ticket) }
                    active={ equal(pathquery, presetLink('/', query, PRESETS.my_ticket)) }>
            My Tickets
          </Preset>
          <Preset action="/timeline" active={pathname == '/timeline'}>
            Timeline
          </Preset>
            <Preset action={ presetLink('/', query, PRESETS.sprint_issues) }
                    active={ equal(pathquery, presetLink('/', query, PRESETS.sprint_issues)) }>
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
