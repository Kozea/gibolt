import React, { Component } from 'react'
import { block } from '../utils'
import Preset from '../components/Preset'
import './Presets.sass'


const b = block('Presets')
export default function Presets() {
  return (
    <header className={ b }>
      <h1 className={ b('title') }>Gibolt</h1>
      <nav>
        <ul className={ b('nav') }>
          <Preset action="my_sprint" active={true}>
            My Sprint
          </Preset>
          <Preset action="my_tickets">
            My Tickets
          </Preset>
          <Preset action="show_now">
            Timeline
          </Preset>
          <Preset action="show_sprint_issues">
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
