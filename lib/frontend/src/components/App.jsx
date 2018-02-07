import './App.sass'

import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import ReactModal from 'react-modal'
import { Route, Switch } from 'react-router-dom'

import { block, connect } from '../utils'
import Admin from './Admin'
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
import Timeline from './Timeline'
import CreateCircle from './CreateCircle'
import CreateRole from './CreateRole'
import Roles from './Roles'
import Role from './Role'
import { setModal } from '../actions/issues'

const b = block('App')
ReactModal.setAppElement('#root')

class App extends Component {
  constructor(props) {
    super(props)
    this.props = props
  }

  render() {
    const { modal, onModalClose } = this.props
    return (
      <main className={b()}>
        <Helmet>
          <title>Gibolt</title>
        </Helmet>
        <Presets />
        <ReactModal
          className="modal"
          overlayClassName="modal-overlay"
          isOpen={!!modal}
          onRequestClose={() => onModalClose()}
          shouldCloseOnOverlayClick
        >
          {modal}
          <button onClick={onModalClose}>Close</button>
        </ReactModal>
        <Switch>
          <Route exact path="/" component={IssuesDashboard} />
          <Route path="/timeline" component={Timeline} />
          <Route path="/report" component={Report} />
          <Route path="/circles" component={Circles} />
          <Route path="/circle" component={Circle} />
          <Route path="/createCircle" component={CreateCircle} />
          <Route path="/roles" component={Roles} />
          <Route path="/role" component={Role} />
          <Route path="/createRole" component={CreateRole} />
          <Route path="/createIssue" component={IssueCreation} />
          <Route path="/meeting" component={Meeting} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/createReport" component={MeetingsReportCreation} />
          <Route path="/admin" component={Admin} />
          <Route component={NotFound} />
        </Switch>
      </main>
    )
  }
}
export default connect(
  state => ({
    modal: state.modal,
  }),
  dispatch => ({
    onModalClose: () => {
      dispatch(setModal(null))
    },
  })
)(App)
