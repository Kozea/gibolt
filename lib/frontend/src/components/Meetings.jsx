import './Meetings.sass'

import { format } from 'date-fns'
import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect, getColor } from '../utils'
import Loading from './Loading'

const b = block('Meetings')

function getCircleName(circleId, circles) {
  return circles.filter(circle => circle.circle_id === circleId)[0].circle_name
}

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
            <select id="circles" name="circles">
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
            <select id="meeting-type" name="meeting-type">
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
                      getColor(
                        label,
                        getCircleName(meeting.circle_id, circles.results)
                      )
                    )
                    .map(label => label.color)
                    .toString()}`,
                }}
              >
                {format(new Date(meeting.created_at), 'DD/MM/YYYY')} -{' '}
                {getCircleName(meeting.circle_id, circles.results)} -{' '}
                {meeting.report_type}
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
