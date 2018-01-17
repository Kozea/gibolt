import './Meeting.sass'

import { format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { fetchResults, goBack, setLoading } from '../actions'
import { fetchReport, toggleEdition } from '../actions/meetings'
import { block, connect } from '../utils'
import Loading from './Loading'
import MarkdownEditor from './MarkdownEditor'

var ReactMarkdown = require('react-markdown')

const b = block('Meeting')

class Meeting extends React.Component {
  componentWillMount() {
    this.props.sync()
  }

  render() {
    const {
      error,
      history,
      loading,
      meeting,
      meeetingOnEdition,
      onGoBack,
      onEditClick,
      users,
    } = this.props
    return (
      <section className={b()}>
        <Helmet>
          <title>Gibolt - Meetings</title>
        </Helmet>

        <article className={b('meeting')}>
          {error && (
            <article className={b('group', { error: true })}>
              <h2>Meeting</h2>
              <h2>Error during fetch</h2>
              <code>{error}</code>
            </article>
          )}
          {loading && <Loading />}
          <h2>Meeting</h2>
          {meeting.report_id && (
            <div>
              {format(new Date(meeting.created_at), 'DD/MM/YYYY')} -{' '}
              {meeting.circle[0].circle_name} - {meeting.report_type}{' '}
              {!meeetingOnEdition && (
                <span className={b('unlink')} title="Edit report">
                  <i
                    className="fa fa-edit editMeeting"
                    aria-hidden="true"
                    onClick={() => onEditClick()}
                  />
                </span>
              )}
              <br />
              author:{' '}
              {users
                .filter(user => user.user_id === meeting.author_id)
                .map(user => user.user_name)}
              {meeetingOnEdition ? (
                <form onSubmit={event => event.preventDefault()}>
                  <div className={b('editor')}>
                    <label>
                      Report content:
                      <MarkdownEditor />
                    </label>
                  </div>
                  <article className={b('action')}>
                    <button type="submit">Submit</button>
                    <button type="submit" onClick={() => onEditClick()}>
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
      onEditClick: () => {
        dispatch(toggleEdition())
      },
      onGoBack: history => {
        dispatch(goBack(history))
      },
      sync: () => {
        dispatch(setLoading('users'))
        dispatch(fetchResults('users'))
        dispatch(setLoading('meeting'))
        dispatch(fetchReport())
      },
    })
  )(Meeting)
)
