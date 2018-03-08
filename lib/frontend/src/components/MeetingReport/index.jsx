import './MeetingReport.sass'

import { format } from 'date-fns'
import { parse } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import ReactModal from 'react-modal'
import { withRouter } from 'react-router-dom'

import {
  fetchResults,
  setLoading,
  setParams,
  updateMarkdown,
} from '../../actions'
import { setModal } from '../../actions/issues'
import {
  disableEdition,
  emptyMeeting,
  expandMilestone,
  fetchMeetingData,
  fetchReport,
  getLastReports,
  sortAttendees,
  submitOrUpdateReport,
  updateMeetingAttendees,
} from '../../actions/meetings'
import { block, connect } from '../../utils'
import IssueCreationDetail from './../IssueCreationDetail'
import Loading from './../Loading'
import MarkdownEditor from './../Utils/MarkdownEditor'
import ReportAgenda from './ReportAgenda'
import ReportItems from './ReportItems'
import ReportProjects from './ReportProjects'

const b = block('MeetingReport')
var ReactMarkdown = require('react-markdown')

function clearTimer(meetingReport) {
  meetingReport.setState({ timer: null })
}

class MeetingsReport extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      selectedCircle: {},
      timer: null,
    }
  }

  componentDidMount() {
    const search = parse(this.props.location.search)
    const param = this.props.isCreation
      ? {
          circle_id: search.circle_id ? +search.circle_id : '',
          meeting_name: search.meeting_name ? search.meeting_name : '',
        }
      : search
    this.props.sync(param, this.props.isCreation)
    ReactModal.setAppElement('#root')
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.params.circle_id !== this.props.params.circle_id ||
      nextProps.params.meeting_name !== this.props.params.meeting_name
    ) {
      this.props.onParamsChange(nextProps.params)
    }
  }

  setTimer() {
    if (!this.state.timer) {
      this.setState({
        timer: setTimeout(
          this.props.onSave,
          30000,
          this.props.isCreation,
          this
        ),
      })
    }
  }

  render() {
    const {
      circles,
      errors,
      history,
      isCreation,
      isEditionDisabled,
      loading,
      meeting,
      meetings, // previous meetings
      modal,
      onEditClick,
      onGoBack,
      onMilestoneClick,
      onModalClose,
      onAttendeesChange,
      onSubmit,
      params,
      sync,
      users,
    } = this.props
    const attendees = sortAttendees(meeting.attendees)
    const oldReport = meeting.attendees.length === 0 && !isCreation
    const circleId = isCreation ? params.circle_id : meeting.circle_id
    const meetingType = isCreation ? params.meeting_name : meeting.report_type
    return (
      <section className={b()}>
        <Helmet>
          <title>{`Gibolt - ${
            meeting.report_id ? 'Create a report' : 'Meeting'
          }`}</title>
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
          <h2>{isCreation ? 'Create a report' : 'Meeting'}</h2>
          {errors.circles || errors.labels || errors.users ? (
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
              {errors.meeting && (
                <article className={b('group', { error: true })}>
                  <h3>Error during fetch</h3>
                  <code>{`Error: ${errors.meeting}`}</code>
                  <br />
                  <br />
                </article>
              )}
              <span className={b('head')}>
                {circles
                  .filter(circle => circle.circle_id === circleId)
                  .map(circle => circle.circle_name)}{' '}
                - {meetingType}
                {!meeting.is_submitted && ' (DRAFT)'}
                {meeting.report_id && ` - #${meeting.report_id}`}
              </span>
              <div className={b('meetingInfos')}>
                {meeting.report_id && (
                  <span>
                    created by:{' '}
                    {users
                      .filter(user => user.user_id === meeting.author_id)
                      .map(user => user.user_name)}{' '}
                    <span className={b('date')}>
                      <i className="fa fa-clock-o" aria-hidden="true" />
                      {format(new Date(meeting.created_at), 'DD/MM/YYYY HH:mm')}
                    </span>
                    {!isCreation && (
                      <span>
                        {oldReport ? (
                          ' (Old version, not editable)'
                        ) : (
                          <span
                            className={b('unlink')}
                            title="Edit report"
                            onClick={() => onEditClick(meeting.content)}
                          >
                            <i
                              className="fa fa-edit editMeeting"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </span>
                    )}
                    {meeting.modified_at && (
                      <span>
                        <br />modified by:{' '}
                        {users
                          .filter(user => user.user_id === meeting.modified_by)
                          .map(user => user.user_name)}{' '}
                        <span className={b('date')}>
                          <i className="fa fa-clock-o" aria-hidden="true" />
                          {format(
                            new Date(meeting.modified_at),
                            'DD/MM/YYYY HH:mm'
                          )}
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className={b('content')}>
                {!oldReport && (
                  <span>
                    <span>
                      <h3>Presents:</h3>
                      {attendees.length > 0 ? (
                        <ul>
                          {attendees.map(user => (
                            <li key={user.user_name}>
                              <input
                                checked={user.checked}
                                disabled={isEditionDisabled}
                                id="attendees"
                                name={user.user_name}
                                onChange={event => {
                                  this.setTimer()
                                  onAttendeesChange(event.target)
                                }}
                                type="checkbox"
                              />
                              {user.user_name}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No roles defined.'
                      )}
                    </span>
                    {(params.meeting_name === 'Triage' ||
                      (!isCreation && meeting.report_type === 'Triage')) && (
                      <span>
                        <ReportItems
                          actions={meeting.actions}
                          isEditionDisabled={isEditionDisabled}
                          indicators={meeting.indicators}
                          meetings={meetings}
                          currentMeeting={{
                            report_id: meeting.report_id,
                            created_at: meeting.created_at,
                          }}
                          setTimer={() => this.setTimer()}
                        />
                        <ReportProjects
                          isEditionDisabled={isEditionDisabled}
                          projects={meeting.projects}
                          onMilestoneClick={onMilestoneClick}
                          setTimer={() => this.setTimer()}
                        />
                      </span>
                    )}
                    {(params.meeting_name === 'Triage' ||
                      meeting.report_type === 'Triage' ||
                      params.meeting_name === 'Gouvernance' ||
                      meeting.report_type === 'Gouvernance') && (
                      <span>
                        <ReportAgenda
                          isEditionDisabled={isEditionDisabled}
                          issues={meeting.agenda}
                          setTimer={() => this.setTimer()}
                        />
                      </span>
                    )}
                  </span>
                )}
                <h3>Report content:</h3>
                <div className={b('reportContent')}>
                  {isEditionDisabled ? (
                    <ReactMarkdown
                      className={`${b('markdownContent').toString()}${
                        isEditionDisabled ? '__disabled' : ''
                      }`}
                      source={meeting.content === '' ? 'RAS' : meeting.content}
                    />
                  ) : (
                    <MarkdownEditor useStore setTimer={() => this.setTimer()} />
                  )}
                </div>
              </div>
              {isEditionDisabled ? (
                <article className={b('action')}>
                  <button
                    type="submit"
                    onClick={() => onGoBack(circleId, history)}
                  >
                    Back to Circle
                  </button>
                </article>
              ) : (
                <article className={b('action')}>
                  <button
                    type="submit"
                    disabled={attendees.length === 0}
                    onClick={() =>
                      onSubmit(history, isCreation, this.state.timer)
                    }
                  >
                    Submit
                  </button>
                  <button
                    type="submit"
                    onClick={() => {
                      isCreation
                        ? onGoBack(circleId, history)
                        : sync(params, isCreation)
                    }}
                  >
                    Cancel
                  </button>
                </article>
              )}
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
      circles: state.circles.results,
      errors: {
        circles: state.circles.error,
        labels: state.labels.error,
        meeting: state.meeting.error,
        users: state.users.error,
      },
      isEditionDisabled: state.meeting.isEditionDisabled,
      meetings: state.meetings.results,
      loading:
        (state.circles.loading ? 1 : 0) +
        (state.labels.loading ? 1 : 0) +
        (state.meeting.loading ? 1 : 0) +
        (state.users.loading ? 1 : 0),
      meeting: state.meeting.results,
      modal: state.modal,
      params: state.params,
      users: state.users.results,
    }),
    dispatch => ({
      onAttendeesChange: target => {
        dispatch(updateMeetingAttendees(target.name, target.checked))
      },
      onEditClick: content => {
        dispatch(updateMarkdown(content))
        dispatch(disableEdition(false))
      },
      onGoBack: (circleId, history) => {
        dispatch(updateMarkdown(''))
        if (circleId) {
          history.push(`/circle?circle_id=${circleId}`)
        } else {
          history.push('/circles')
        }
      },
      onMilestoneClick: milestoneId => {
        dispatch(expandMilestone(milestoneId))
      },
      onModalClose: () => {
        dispatch(setModal(false, false, null))
      },
      onParamsChange: locationSearch => {
        dispatch(setLoading('meeting'))
        dispatch(fetchMeetingData(locationSearch))
      },
      onSave: (isCreation, meetingReport) => {
        Promise.resolve(dispatch(submitOrUpdateReport(isCreation, false))).then(
          () => {
            clearTimer(meetingReport)
          }
        )
      },
      onSubmit: (history, isCreation, timerId) => {
        if (isCreation) {
          dispatch(updateMarkdown(''))
        }
        dispatch(submitOrUpdateReport(isCreation, true, history, true))
        if (timerId) {
          clearTimeout(timerId)
        }
      },
      sync: (locationSearch, isCreation) => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('users'))
        dispatch(setLoading('circles'))
        dispatch(setLoading('labels'))
        Promise.all([
          dispatch(emptyMeeting()),
          dispatch(fetchResults('users')),
          dispatch(fetchResults('circles')),
          dispatch(fetchResults('labels')),
          dispatch(getLastReports(locationSearch, isCreation)),
        ]).then(() => {
          if (
            isCreation &&
            locationSearch.circle_id !== '' &&
            locationSearch.meeting_name !== ''
          ) {
            dispatch(disableEdition(false))
            dispatch(setLoading('meeting'))
            dispatch(fetchMeetingData(locationSearch))
          }
          if (!isCreation) {
            dispatch(setLoading('meeting'))
            dispatch(fetchReport(locationSearch))
          }
        })
      },
      onUpdateMarkdown: () => {
        dispatch(updateMarkdown(''))
      },
    })
  )(MeetingsReport)
)
