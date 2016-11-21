import React, { Component } from 'react'
import { AbsoluteFragment } from 'redux-little-router'
import { block } from '../utils'
import IssuesDashboard from './IssuesDashboard'
import Timeline from './Timeline'
import Report from './Report'
import Repositories from './Repositories'
import Presets from './Presets'
import './App.sass'


const b = block('App')
export default class App extends Component {
  constructor(props) {
    super(props)
    this.props = props
  }

  render() {
    return (
      <main className={ b }>
        <Presets />
        <AbsoluteFragment forRoute='/'>
          <IssuesDashboard />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/timeline'>
          <Timeline />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/report'>
          <Report />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/repositories'>
          <Repositories />
        </AbsoluteFragment>
      </main>
    )
  }
}
