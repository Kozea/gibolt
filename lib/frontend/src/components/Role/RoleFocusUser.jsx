import { addDays, format } from 'date-fns'
import React from 'react'

import { block } from '../../utils'

const b = block('Role')

export default function RoleFocusUser(props) {
  const { duration, focusName, focusUser } = props
  return (
    <span key={focusUser.role_focus_user_id}>
      <img
        className={b('avatar')}
        src={focusUser.avatar_url}
        alt="avatar"
        title={focusUser.user_name}
      />{' '}
      {focusName}
      {duration &&
        focusUser.start_date && (
          <span className={b('lighter')}>
            {`until: ${format(
              addDays(new Date(focusUser.start_date), duration),
              'DD/MM/YYYY'
            )}`}
          </span>
        )}
    </span>
  )
}
