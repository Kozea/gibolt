import './Circle.sass'

import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import { connect } from '../../utils'
import { stringify } from '../../utils/querystring'

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
              className={b.e('link')}
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
              className={b.e('link')}
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
