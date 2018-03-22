import { addDays, differenceInDays, format } from 'date-fns'
import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block } from '../../utils'

const b = block('Role')

export default function RoleFocusUser(props) {
  const { duration, focusId, focusName, focusUser } = props
  const endDate = focusUser.end_date
    ? focusUser.end_date
    : duration && focusUser.start_date
      ? addDays(new Date(focusUser.start_date), duration)
      : null
  const distance = differenceInDays(new Date(endDate), new Date())
  return (
    <span key={focusUser.role_focus_user_id}>
      <Link
        to={{
          pathname: '/role_focus',
          search: stringify({ role_focus_id: focusId }),
        }}
      >
        <img
          className={b('avatar')}
          src={focusUser.avatar_url}
          alt="avatar"
          title={focusUser.user_name}
        />{' '}
        {focusName}
        {endDate && (
          <span className={b('lighter')}>
            {`until: ${format(endDate, 'DD/MM/YYYY')}`}
            {distance < 0 ? (
              <span className={b('inactive')}>
                {' (this focus must be inactive)'}
              </span>
            ) : distance < 10 ? (
              <span className={b('end')}>
                {' (this focus will end in 10 days)'}
              </span>
            ) : (
              ''
            )}
          </span>
        )}
      </Link>
    </span>
  )
}
