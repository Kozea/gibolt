import './RoleFocusEndDate.sass'

import block from 'bemboo'
import { addDays, differenceInDays, format } from 'date-fns'
import React from 'react'

import { daysBeforeExpiration } from '../../utils'

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
    <span className={b}>
      {endDate && (
        <span className={b.e('lighter')}>
          {displayDate && `until: ${format(endDate, 'DD/MM/YYYY')}`}
          {distance < 0 ? (
            <span className={b.e('inactive')}>{' (this focus expired)'}</span>
          ) : distance < daysBeforeExpiration ? (
            <span className={b.e('end')}>
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
