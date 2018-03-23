import './MeetingReport.sass'

import React from 'react'

import { block } from '../../utils'
import RoleFocusUser from './../Role/RoleFocusUser'

const b = block('MeetingReport')

export default function MeetingRolesExpiration(props) {
  const { meeting, meetingType } = props
  return (
    <span>
      {meeting.expiredRoles &&
        meeting.expiredRoles.length > 0 && (
          <span>
            {meetingType === 'Gouvernance' ? (
              <h3>Elections:</h3>
            ) : (
              <h5>Following roles are/will be expired:</h5>
            )}
            <ul className={b('elections')}>
              {meeting.expiredRoles.map(focus => (
                <li key={focus.role_focus_id}>
                  <span className={b('bullet')} />
                  {focus.role_name}
                  {focus.role_focus_users.map(focusUser => (
                    <span key={focusUser.user_id}>
                      <RoleFocusUser
                        key={focusUser.user_id}
                        focusName={focus.focus_name}
                        focusId={focus.role_focus_id}
                        duration={focus.duration}
                        focusUser={focusUser}
                      />
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </span>
        )}
    </span>
  )
}
