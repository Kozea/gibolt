import './App.sass'

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'

import { block } from '../utils'
import Admin from './Admin'
import Circle from './Circle'
import Circles from './Circles'
import CreateCircle from './CreateCircle'
import CreateRole from './CreateRole'
import IssuesDashboard from './IssuesDashboard'
import Meeting from './Meeting'
import MeetingReportCreation from './MeetingReportCreation'
import Meetings from './Meetings'
import NotFound from './NotFound'
import Presets from './Presets'
import Report from './Report'
import Role from './Role'
import RoleFocus from './RoleFocus'
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
          <Route path="/admin" component={Admin} />
          <Route path="/circle" component={Circle} />
          <Route path="/circles" component={Circles} />
          <Route path="/createCircle" component={CreateCircle} />
          <Route path="/createReport" component={MeetingReportCreation} />
          <Route path="/createRole" component={CreateRole} />
          <Route path="/meeting" component={Meeting} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/report" component={Report} />
          <Route path="/role" component={Role} />
          <Route path="/role_focus" component={RoleFocus} />
          <Route path="/timeline" component={Timeline} />
          <Route component={NotFound} />
        </Switch>
      </main>
    )
  }
}
