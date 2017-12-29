import './Meetings.sass'

import React from 'react'
import { Helmet } from 'react-helmet'

import { block, connect } from '../utils'
import Loading from './Loading'

const b = block('Meetings')

function Meetings({ circles, meetingsTypes }) {
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
            Meetings type:
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
      </article>
    </section>
  )
}
export default connect(state => ({
  circles: state.circles,
  meetingsTypes: state.meetingsTypes,
}))(Meetings)
