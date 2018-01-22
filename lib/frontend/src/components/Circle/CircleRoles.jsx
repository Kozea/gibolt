import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { fetchResults, setLoading } from '../../actions'
import { block, connect, sortRoles } from '../../utils'

const b = block('Circle')

function getUserInfo(roleUser, user) {
  if (roleUser === user.user_id) {
    return user
  }
}

class CircleRoles extends React.Component {
  componentDidMount() {
    this.props.sync()
  }

  render() {
    const { circle, users } = this.props
    const sortedRoles = sortRoles(circle.roles)

    return (
      <article>
        <h3>
          Roles{' '}
          {circle.is_active && (
            <Link
              to={{
                pathname: '/createrole',
                search: stringify({ circle_id: circle.circle_id }),
              }}
            >
              <span
                className={b('unlink')}
                disabled={!circle.is_active}
                title="Add role"
              >
                <i className="fa fa-plus-circle" aria-hidden="true" />
              </span>
            </Link>
          )}
        </h3>
        {sortedRoles && sortedRoles.length > 0 ? (
          <ul>
            {sortedRoles.map(role => (
              <li key={role.role_id} className={b('role')}>
                <span className={b('bullet')} />
                <Link
                  to={{
                    pathname: '/role',
                    search: stringify({ role_id: role.role_id }),
                  }}
                >
                  {role.role_name}
                </Link>{' '}
                :{' '}
                <img
                  key={role.user_id}
                  className={b('avatar')}
                  src={users
                    .filter(user => getUserInfo(role.user_id, user))
                    .map(user => user.avatar_url)
                    .toString()}
                  alt="avatar"
                  title={users
                    .filter(user => getUserInfo(role.user_id, user))
                    .map(user => user.user_name)
                    .toString()}
                />
                {'  '}
                {users
                  .filter(user => getUserInfo(role.user_id, user))
                  .map(user => user.user_name)
                  .toString()}
              </li>
            ))}
          </ul>
        ) : (
          <span>No roles defined</span>
        )}
      </article>
    )
  }
}

export default connect(
  state => ({
    users: state.users.results,
  }),
  dispatch => ({
    sync: () => {
      dispatch(setLoading('users'))
      dispatch(fetchResults('users'))
    },
  })
)(CircleRoles)
