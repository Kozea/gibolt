import React, { Component } from 'react'
import { AbsoluteFragment } from 'redux-little-router'
import { block } from '../utils'
import PageIssues from './PageIssues'
import PageTimeline from './PageTimeline'
import PageReport from './PageReport'
import PageRepositories from './PageRepositories'
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
        <AbsoluteFragment forRoute='/'>
          <PageIssues />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/timeline'>
          <PageTimeline />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/report'>
          <PageReport />
        </AbsoluteFragment>
        <AbsoluteFragment forRoute='/repositiories'>
          <PageRepositories />
        </AbsoluteFragment>
      </main>
    )
  }
}
