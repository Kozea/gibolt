import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block, connect } from '../../utils'

const b = block('Circle')

function Circle({ circle, meetingsTypes }) {
  return (
    <div>
      <article>
        <h3>Meetings</h3>
        {meetingsTypes.map(type => (
          <Link
            className={b('link')}
            key={type.type_id}
            to={{
              pathname: '/createReport',
              search: stringify({
                circle_id: circle.circle_id,
                meeting_name: type.type_name,
              }),
            }}
          >
            <button
              key={type.type_id}
              type="submit"
              disabled={!circle.is_active}
            >
              {type.type_name}
            </button>
          </Link>
        ))}
      </article>
      {circle.nb_reports > 0 && (
        <article>
          <h3>Reports</h3>
          <Link
            className={b('link')}
            to={{
              pathname: '/meetings',
              search: stringify({
                circle_id: circle.circle_id,
              }),
            }}
          >
            View all reports ({circle.nb_reports})
          </Link>
        </article>
      )}
    </div>
  )
}

export default connect(state => ({
  circle: state.circle.results,
  meetingsTypes: state.meetingsTypes.results,
}))(Circle)
