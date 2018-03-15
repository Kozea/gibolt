import React from 'react'

import RoleFocusUser from './RoleFocusUser'
import { block, connect } from '../../utils'

const b = block('Role')

function getUserInfo(roleUser, user) {
  if (roleUser === user.user_id) {
    return user
  }
}

function RoleFocus(props) {
  const { duration, focuses, users } = props
  return (
    <article>
      <h3>
        Focus{' '}
        <span className={b('unlink')} title="Add focus">
          <i className="fa fa-plus-circle" aria-hidden="true" />
        </span>
      </h3>
      {focuses && focuses.length > 0 ? (
        <ul>
          {focuses.map(focus => (
            <li key={focus.role_focus_id}>
              <span className={b('bullet')} />
              {focus.focus_name}
              {focus.role_focus_users.map(focusUser => (
                <RoleFocusUser
                  key={focusUser.user_id}
                  duration={duration}
                  focusUser={focusUser}
                  user={
                    users
                      .filter(user => getUserInfo(focusUser.user_id, user))
                      .map(user => user)[0]
                  }
                />
              ))}
            </li>
          ))}
        </ul>
      ) : (
        'No focus'
      )}
    </article>
  )
}

export default connect(state => ({
  users: state.users.results,
}))(RoleFocus)
