import './App.sass'

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'

import { block } from '../utils'
import Circle from './Circle'
import Circles from './Circles'
import IssueCreation from './IssueCreation'
import IssuesDashboard from './IssuesDashboard'
import Meeting from './Meeting'
import Meetings from './Meetings'
import MeetingsReportCreation from './MeetingsReportCreation'
import NotFound from './NotFound'
import Presets from './Presets'
import Report from './Report'
import Repositories from './Repositories'
import Repository from './Repository'
import Timeline from './Timeline'

const b = block('App')

export default class App extends Component {
  constructor(props) {
    super(props)
    this.props = props
  }

  render() {
    return (
      <main className={b()}>
        <Helmet>
          <title>Gibolt</title>
        </Helmet>
        <Presets />
        <Switch>
          <Route exact path="/" component={IssuesDashboard} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/report" component={Report} />
          <Route path="/repositories" component={Repositories} />
          <Route path="/repository" component={Repository} />
          <Route path="/circles" component={Circles} />
          <Route path="/circle" component={Circle} />
          <Route path="/createIssue" component={IssueCreation} />
          <Route path="/meeting" component={Meeting} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/createReport" component={MeetingsReportCreation} />
          <Route component={NotFound} />
        </Switch>
      </main>
    )
  }
}
