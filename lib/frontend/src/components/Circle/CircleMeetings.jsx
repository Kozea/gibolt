import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import { block, connect } from '../../utils'

const b = block('Circle')

class CircleMeetings extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const { circle, meetingsTypes } = this.props
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
            <br />
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
}

export default connect(
  state => ({
    meetingsTypes: state.meetingsTypes.results,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('meetingsTypes'))
      dispatch(fetchResults('meetingsTypes'))
    },
  })
)(CircleMeetings)
