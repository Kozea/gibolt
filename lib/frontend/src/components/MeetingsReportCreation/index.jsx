import './MeetingsReportCreation.sass'

import { parse } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import ReactModal from 'react-modal'
import { withRouter } from 'react-router-dom'

import {
  updateMarkdown,
  fetchResults,
  goBack,
  setLoading,
  setParams,
} from '../../actions'
import { setModal } from '../../actions/issues'
import {
  fetchMeetingData,
  getUsersListFromRoles,
  submitReport,
  updateReportsList,
} from '../../actions/meetings'
import { expandMilestone } from '../../actions/milestones'
import { block, connect, sortUsers } from '../../utils'
import IssueCreationDetail from './../IssueCreationDetail'
import Loading from './../Loading'
import MarkdownEditor from './../Utils/MarkdownEditor'
import ReportAgenda from './ReportAgenda'
import ReportItems from './ReportItems'
import ReportProjects from './ReportProjects'

const b = block('MeetingsReportCreation')

class MeetingsReportCreation extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      selectedCircle: {},
    }
  }

  componentWillMount() {
    this.props.onUpdateMarkdown()
  }

  componentDidMount() {
    const search = parse(this.props.location.search)
    this.props.sync({
      circle_id: search.circle_id ? +search.circle_id : '',
      meeting_name: search.meeting_name ? search.meeting_name : '',
    })
    ReactModal.setAppElement('#root')
  }

  render() {
    const {
      agendaIssues,
      circleMilestones,
      circles,
      errors,
      history,
      issues,
      items,
      loading,
      meetingsTypes,
      modal,
      onGoBack,
      onMilestoneClick,
      onModalClose,
      onSelectChange,
      onSubmit,
      params,
      search,
      users,
    } = this.props
    const { selectedCircle } = this.state
    selectedCircle.selectedCircle = this.state.selectedCircle
    let usersList = []
    if (selectedCircle.roles && users) {
      usersList = getUsersListFromRoles(selectedCircle.roles, users)
    }
    if (usersList.length > 0) {
      usersList = sortUsers(usersList)
    }

    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Create a report</title>
        </Helmet>
        <ReactModal
          className={b('modal')}
          overlayClassName={b('modal-overlay')}
          isOpen={!!modal.display}
          onRequestClose={() => onModalClose()}
          shouldCloseOnOverlayClick
        >
          <IssueCreationDetail onModalClose={onModalClose} />
        </ReactModal>
        {loading !== 0 && <Loading />}
        <article className={b('meetings')}>
          <h2>Create a report</h2>
          {errors.circles ||
          errors.items ||
          errors.meetingsTypes ||
          errors.projects ||
          errors.users ? (
            <article className={b('group', { error: true })}>
              <h2>Error during fetch</h2>
              <code>
                {Object.keys(errors).map(
                  key =>
                    errors[key] === null ? (
                      ''
                    ) : (
                      <div>{`${key}: ${errors[key]} `}</div>
                    )
                )}
              </code>
              <br />
            </article>
          ) : (
            <span>
              {errors.meetings && (
                <article className={b('group', { error: true })}>
                  <h2>Error during creation</h2>
                  <code>{`meetings : ${errors.meetings}`}</code>
                  <br />
                </article>
              )}
              <form onSubmit={event => event.preventDefault()}>
                <label>
                  Circle:
                  <select
                    id="circles"
                    name="circles"
                    value={params.circle_id}
                    disabled={search !== ''}
                    onChange={event => onSelectChange(event)}
                  >
                    <option value="" />
                    {circles.results.map(circle => (
                      <option key={circle.circle_id} value={circle.circle_id}>
                        {circle.circle_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Meetings:
                  <select
                    id="meetingType"
                    name="meetingType"
                    value={params.meeting_name}
                    disabled={search !== ''}
                    onChange={event => onSelectChange(event)}
                  >
                    <option value="" />
                    {meetingsTypes.results.map(type => (
                      <option key={type.type_id} value={type.type_name}>
                        {type.type_name}
                      </option>
                    ))}
                  </select>
                </label>
                <br />
                <div className={b('content')}>
                  <span>
                    <h3>Presents:</h3>
                    {selectedCircle.roles && (
                      <span>
                        {selectedCircle.roles.length > 0 &&
                        usersList.length > 0 ? (
                          <ul>
                            {usersList.map(
                              user =>
                                user && (
                                  <li key={user.user_id}>
                                    <input
                                      type="checkbox"
                                      name={user.user_name}
                                      id="users"
                                      defaultChecked
                                    />
                                    {user.user_name}
                                  </li>
                                )
                            )}
                          </ul>
                        ) : (
                          'No roles defined'
                        )}
                      </span>
                    )}
                  </span>
                  {params.meeting_name === 'Triage' && (
                    <span>
                      <ReportItems
                        items={items}
                        selectedCircle={selectedCircle}
                      />
                      <ReportProjects
                        circleMilestones={circleMilestones}
                        issues={issues}
                        onMilestoneClick={onMilestoneClick}
                      />
                    </span>
                  )}
                  {(params.meeting_name === 'Triage' ||
                    params.meeting_name === 'Gouvernance') && (
                    <span>
                      <ReportAgenda issues={agendaIssues} />
                    </span>
                  )}
                  <h3>Report content:</h3>
                  <MarkdownEditor />
                </div>
                <article className={b('action')}>
                  <button
                    type="submit"
                    onClick={event =>
                      onSubmit(event, params.meeting_name, history)
                    }
                  >
                    Submit
                  </button>
                  <button type="submit" onClick={() => onGoBack(history)}>
                    Cancel
                  </button>
                </article>
              </form>
            </span>
          )}
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      agendaIssues: state.issues.results.agenda,
      circleMilestones: state.circleMilestones.results,
      circles: state.circles,
      errors: {
        circles: state.circles.error,
        items: state.items.error,
        meetings: state.meetings.error,
        meetingsTypes: state.meetingsTypes.error,
        projects: state.circleMilestones.error,
        users: state.users.error,
      },
      issues: state.issues.results.issues,
      items: state.items.results,
      loading:
        (state.circleMilestones.loading ? 1 : 0) +
        (state.circles.loading ? 1 : 0) +
        (state.items.loading ? 1 : 0) +
        (state.issues.loading ? 1 : 0) +
        (state.users.loading ? 1 : 0),
      meeting: state.meeting,
      meetingsTypes: state.meetingsTypes,
      modal: state.modal,
      search: state.router.location.search,
      params: state.params,
      users: state.users.results,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(updateMarkdown(''))
        dispatch(goBack(history))
      },
      onMilestoneClick: milestoneId => {
        dispatch(expandMilestone(milestoneId))
      },
      onModalClose: () => {
        dispatch(setModal(false, false, null))
      },
      onSelectChange: event => {
        dispatch(updateReportsList(event))
      },
      onSubmit: (event, meetingType, history) => {
        event.preventDefault()
        dispatch(submitReport(event, meetingType, history))
        dispatch(updateMarkdown(''))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('users'))
        dispatch(setLoading('circles'))
        dispatch(setLoading('meetingsTypes'))
        dispatch(setLoading('labels'))
        Promise.all([
          dispatch(fetchResults('users')),
          dispatch(fetchResults('circles')),
          dispatch(fetchResults('meetingsTypes')),
          dispatch(fetchResults('labels')),
        ]).then(() => {
          dispatch(fetchMeetingData(locationSearch))
        })
      },
      onUpdateMarkdown: () => {
        dispatch(updateMarkdown(''))
      },
    })
  )(MeetingsReportCreation)
)
