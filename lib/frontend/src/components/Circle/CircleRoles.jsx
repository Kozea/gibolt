import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block, connect } from '../../utils'

const b = block('Circle')

function getUserInfo(roleUser, user) {
  if (roleUser === user.user_id) {
    return user
  }
}

function Circle({ circle, users }) {
  return (
    <article>
      <h3>Roles</h3>
      {circle.roles && circle.roles.length > 0 ? (
        <ul>
          {circle.roles.map(role => (
            <li key={role.role_id} className={b('role')}>
              <span className={b('bullet')} />
              <Link
                to={{
                  pathname: '/role',
                  search: stringify({ id: role.role_id }),
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
      <Link
        to={{
          pathname: '/createrole',
          search: stringify({ circle_id: circle.circle_id }),
        }}
      >
        <button type="submit">Add a Role</button>
      </Link>
    </article>
  )
}

export default connect(state => ({
  circle: state.circle.results,
  users: state.users.results,
}))(Circle)
