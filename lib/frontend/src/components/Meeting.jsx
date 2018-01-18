import './Meeting.sass'

import { format } from 'date-fns'
import { parse } from 'query-string'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import {
  checkMarkdown,
  delMarkdown,
  fetchResults,
  goBack,
  setLoading,
  setParams,
} from '../actions'
import { fetchReport, toggleEdition, updateReport } from '../actions/meetings'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

var ReactMarkdown = require('react-markdown')

const b = block('Meeting')

class Meeting extends React.Component {
  componentWillMount() {
    const search = parse(this.props.location.search)
    this.props.sync(search)
  }
  render() {
    const {
      error,
      history,
      loading,
      meeting,
      meeetingOnEdition,
      onGoBack,
      onCancelClick,
      onEditClick,
      onSubmit,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Meeting</title>
        </Helmet>
        <article className={b('meeting')}>
          <h2>Meeting</h2>
          {error && (
            <article className={b('group', { error: true })}>
              <h2>Error</h2>
              <code>{error}</code>
            </article>
          )}
          {loading && <Loading />}
          {meeting.report_id && (
            <div>
              {meeting.circle[0].circle_name} - {meeting.report_type}{' '}
              {!meeetingOnEdition && (
                <span className={b('unlink')} title="Edit report">
                  <i
                    className="fa fa-edit editMeeting"
                    aria-hidden="true"
                    onClick={() =>
                      onEditClick(meeting.content, meeetingOnEdition)
                    }
                  />
                </span>
              )}{' '}
              <br />
              created by:{' '}
              {users
                .filter(user => user.user_id === meeting.author_id)
                .map(user => user.user_name)}{' '}
              <span className={b('date')}>
                <i className="fa fa-clock-o" aria-hidden="true" />{' '}
                {format(new Date(meeting.created_at), 'DD/MM/YYYY HH:mm')}
              </span>
              {meeting.modified_at && (
                <span>
                  <br />
                  modified by:{' '}
                  {users
                    .filter(user => user.user_id === meeting.modified_by)
                    .map(user => user.user_name)}{' '}
                  <span className={b('date')}>
                    <i className="fa fa-clock-o" aria-hidden="true" />{' '}
                    {format(new Date(meeting.modified_at), 'DD/MM/YYYY HH:mm')}
                  </span>
                </span>
              )}
              {meeetingOnEdition ? (
                <form onSubmit={event => event.preventDefault()}>
                  <div className={b('editor')}>
                    <label>
                      Report content:
                      <MarkdownEditor />
                    </label>
                  </div>
                  <article className={b('action')}>
                    <button
                      type="submit"
                      onClick={event => onSubmit(event, meeting.report_id)}
                    >
                      Submit
                    </button>
                    <button type="submit" onClick={() => onCancelClick()}>
                      Cancel
                    </button>
                  </article>
                </form>
              ) : (
                <span>
                  <ReactMarkdown
                    className={b('content').toString()}
                    source={meeting.content}
                  />
                  <br />
                  <button type="submit" onClick={() => onGoBack(history)}>
                    Back
                  </button>
                </span>
              )}
            </div>
          )}
        </article>
      </section>
    )
  }
}
export default withRouter(
  connect(
    state => ({
      error: state.meeting.error,
      loading: state.meeting.loading,
      meeting: state.meeting.results,
      meeetingOnEdition: state.meeting.is_in_edition,
      users: state.users.results,
    }),
    dispatch => ({
      onCancelClick: () => {
        dispatch(toggleEdition())
        dispatch(delMarkdown())
      },
      onEditClick: (content, meeetingOnEdition) => {
        if (meeetingOnEdition) {
          dispatch(delMarkdown())
        } else {
          dispatch(checkMarkdown(content))
        }
        dispatch(toggleEdition())
      },
      onGoBack: history => {
        dispatch(goBack(history))
      },
      onSubmit: (event, reportId) => {
        event.preventDefault()
        dispatch(updateReport(reportId, event.target.form.body.value))
      },
      sync: locationSearch => {
        dispatch(setParams(locationSearch))
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('meeting'))
        dispatch(fetchReport(locationSearch))
      },
    })
  )(Meeting)
)
