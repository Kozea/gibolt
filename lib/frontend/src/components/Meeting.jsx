import './Meeting.sass'

import { format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'
import { withRouter } from 'react-router-dom'

import { goBack } from '../actions'
import { block, connect } from '../utils'
import Loading from './Loading'

var ReactMarkdown = require('react-markdown')

const b = block('Meeting')

function Meeting({ error, history, loading, meeting, onGoBack, users }) {
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
        {meeting.report_id && (
          <div>
            <h2>Meeting</h2>
            {format(new Date(meeting.created_at), 'DD/MM/YYYY')} -{' '}
            {meeting.circle[0].circle_name} - {meeting.report_type}
            <br />
            author:{' '}
            {users
              .filter(user => user.user_id === meeting.author_id)
              .map(user => user.user_name)}
            <ReactMarkdown
              className={b('content').toString()}
              source={meeting.content}
            />
          </div>
        )}
        <br />
        <button type="submit" onClick={() => onGoBack(history)}>
          Back
        </button>
      </article>
    </section>
  )
}
export default withRouter(
  connect(
    state => ({
      error: state.meeting.error,
      loading: state.meeting.loading,
      meeting: state.meeting.results,
      users: state.users.results,
    }),
    dispatch => ({
      onGoBack: history => {
        dispatch(goBack(history))
      },
    })
  )(Meeting)
)
