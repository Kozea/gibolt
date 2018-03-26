import { format } from 'date-fns'
import React from 'react'

import { block } from '../../utils'

const b = block('RoleFocus')

export default function RoleFocusUsersList(props) {
  const { roleFocusUsers, currentUserId } = props
  return (
    <div>
      <h3>Previous users</h3>
      {roleFocusUsers.filter(user => user.role_focus_user_id !== currentUserId)
        .length > 0 ? (
        <ul>
          {roleFocusUsers
            .filter(user => user.role_focus_user_id !== currentUserId)
            .map(user => (
              <li key={user.user_id}>
                {user.avatar_url && (
                  <img
                    className={b('avatar')}
                    src={user.avatar_url}
                    alt="avatar"
                    title={user.user_name}
                  />
                )}{' '}
                {` ${user.user_name} (${
                  user.start_date
                    ? `from ${format(user.start_date, 'DD/MM/YYYY')} `
                    : ''
                }until ${format(user.end_date, 'DD/MM/YYYY')})`}
              </li>
            ))}
        </ul>
      ) : (
        'No previous users'
      )}
    </div>
  )
}
