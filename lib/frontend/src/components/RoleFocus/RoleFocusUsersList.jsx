import block from 'bemboo'
import { format } from 'date-fns'
import React from 'react'

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
                    className={b.e('avatar')}
                    src={user.avatar_url}
                    alt="avatar"
                    title={user.user_name}
                  />
                )}{' '}
                {` ${user.user_name} (${
                  user.start_date
                    ? `from ${format(new Date(user.start_date), 'dd/MM/yyyy')} `
                    : ''
                }until ${format(new Date(user.end_date), 'dd/MM/yyyy')})`}
              </li>
            ))}
        </ul>
      ) : (
        'No previous users'
      )}
    </div>
  )
}
