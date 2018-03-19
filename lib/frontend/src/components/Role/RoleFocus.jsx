import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import RoleFocusUser from './RoleFocusUser'
import { block } from '../../utils'

const b = block('Role')

export default function RoleFocus(props) {
  const { duration, focuses } = props
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
              <Link
                to={{
                  pathname: '/role_focus',
                  search: stringify({ role_focus_id: focus.role_id }),
                }}
              >
                {focus.focus_name}
              </Link>
              {focus.role_focus_users.map(focusUser => (
                <RoleFocusUser
                  key={focusUser.user_id}
                  duration={duration}
                  focusUser={focusUser}
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
