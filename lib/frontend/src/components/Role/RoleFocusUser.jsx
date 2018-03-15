import { addDays, format } from 'date-fns'
import React from 'react'

import { block } from '../../utils'

const b = block('Role')

export default function RoleFocusUser(props) {
  const { duration, focusUser, user } = props
  return (
    <span key={focusUser.role_focus_user_id}>
      <img
        className={b('avatar')}
        src={user.avatar_url}
        alt="avatar"
        title={user.user_name}
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
  )
}
