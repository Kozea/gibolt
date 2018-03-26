import './RoleFocusEndDate.sass'

import { addDays, differenceInDays, format } from 'date-fns'
import React from 'react'

import { block, daysBeforeExpiration } from '../../utils'

const b = block('RoleFocusEndDate')

export default function RoleFocusEndDate(props) {
  const { displayDate, duration, focusUser } = props
  const endDate = focusUser.end_date
    ? focusUser.end_date
    : duration && focusUser.start_date
      ? addDays(new Date(focusUser.start_date), duration)
      : null
  const distance = differenceInDays(new Date(endDate), new Date())
  return (
    <span className={b()}>
      {endDate && (
        <span className={b('lighter')}>
          {displayDate && `until: ${format(endDate, 'DD/MM/YYYY')}`}
          {distance < 0 ? (
            <span className={b('inactive')}>{' (this focus expired)'}</span>
          ) : distance < daysBeforeExpiration ? (
            <span className={b('end')}>
              {' (this focus will end in 10 days)'}
            </span>
          ) : (
            ''
          )}
        </span>
      )}
    </span>
  )
}
