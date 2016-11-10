import { connect } from 'react-redux'
import React, { Component } from 'react'
import { block } from '../utils'
import Preset from '../components/Preset'
import './Presets.sass'
import { setPreset } from '../actions'


const b = block('Presets')
function Presets({preset, onPresetClick}) {
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <Preset action="my_sprint" active={preset == 'my_sprint'} onLinkClick={() => onPresetClick('my_sprint')}>
            My Sprint
          </Preset>
          <Preset action="my_tickets" active={preset == 'my_tickets'} onLinkClick={() => onPresetClick('my_tickets')}>
            My Tickets
          </Preset>
          <Preset action="show_now">
            Timeline
          </Preset>
          <Preset action="show_sprint_issues" active={preset == 'show_sprint_issues'} onLinkClick={() => onPresetClick('show_sprint_issues')}>
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
  return {preset: state.preset}
}, (dispatch) => {
  return {
    onPresetClick: (preset) => {
      dispatch(setPreset(preset))
    }
  }
})(Presets)
