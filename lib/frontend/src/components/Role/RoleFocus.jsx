import { addDays, format } from 'date-fns'
import React from 'react'

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
                <span key={focusUser.role_focus_user_id}>
                  <img
                    className={b('avatar')}
                    src={users
                      .filter(user => getUserInfo(focusUser.user_id, user))
                      .map(user => user.avatar_url)
                      .toString()}
                    alt="avatar"
                    title={users
                      .filter(user => getUserInfo(focusUser.user_id, user))
                      .map(user => user.user_name)
                      .toString()}
                  />
                  {duration &&
                    focusUser.start_date && (
                      <span className={b('lighter')}>
                        {` until: ${format(
                          addDays(new Date(focusUser.start_date), duration),
                          'DD/MM/YYYY'
                        )}`}
                      </span>
                    )}
                </span>
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
