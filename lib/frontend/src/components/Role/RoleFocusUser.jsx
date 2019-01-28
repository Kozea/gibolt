import './Role.sass'

import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

import { stringify } from '../../utils/querystring'
import RoleFocusEndDate from './../Utils/RoleFocusEndDate'

const b = block('Role')

export default function RoleFocusUser(props) {
  const { duration, focusId, focusName, focusUser } = props
  return (
    <span key={focusUser.role_focus_user_id}>
      <Link
        to={{
          pathname: '/role_focus',
          search: stringify({ role_focus_id: focusId }),
        }}
      >
        {focusUser.avatar_url && (
          <img
            className={b.e('avatar')}
            src={focusUser.avatar_url}
            alt="avatar"
            title={focusUser.user_name}
          />
        )}{' '}
        {focusName}
        <RoleFocusEndDate
          displayDate
          duration={duration}
          focusUser={focusUser}
        />
      </Link>
    </span>
  )
}
