import './Meetings.sass'

import { format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect, getColor } from '../utils'
import Loading from './Loading'

const b = block('Meetings')

function Meetings({ circles, labels, meetings, meetingsTypes }) {
  return (
    <section className={b()}>
      <Helmet>
        <title>Gibolt - Meetings</title>
      </Helmet>
      {(circles.error || meetingsTypes.error) && (
        <article className={b('group', { error: true })}>
          <h2>Error during fetch</h2>
          <code>
            {circles.error
              ? `circles : ${circles.error}`
              : `Meetings types ${meetingsTypes.error}`}
          </code>
        </article>
      )}
      {(circles.loading || meetingsTypes.loading) && <Loading />}
      <article className={b('meetings')}>
        <h2>Meetings</h2>
        <form onSubmit={event => event.preventDefault()}>
          <label>
            Circle:
            <select
              id="circles"
              name="circles"
              value={meetingsTypes.params.circle_id}
              disabled={meetingsTypes.params.circle_id !== ''}
            >
              <option value="">All</option>
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
              id="meeting-type"
              name="meeting-type"
              value={meetingsTypes.params.meeting_name}
              disabled={meetingsTypes.params.meeting_name !== ''}
            >
              <option value="">All</option>
              {meetingsTypes.results.map(type => (
                <option key={type.type_id} value={type.type_name}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </label>
        </form>
        {meetings.results.length > 0 ? (
          <ul>
            {meetings.results.map(meeting => (
              <li
                key={meeting.report_id}
                className={b('item')}
                style={{
                  color: `${labels
                    .filter(label =>
                      getColor(label, meeting.circle[0].circle_name)
                    )
                    .map(label => label.color)
                    .toString()}`,
                }}
              >
                {format(new Date(meeting.created_at), 'DD/MM/YYYY')} -{' '}
                {meeting.circle[0].circle_name} - {meeting.report_type}
              </li>
            ))}
          </ul>
        ) : (
          <span>No meetings reports</span>
        )}
        <button type="submit">Add a report</button>
      </article>
    </section>
  )
}
export default connect(state => ({
  circles: state.circles,
  labels: state.labels.results.qualifier,
  meetings: state.meetings,
  meetingsTypes: state.meetingsTypes,
}))(Meetings)
