import './MeetingReport.sass'

import block from 'bemboo'
import React from 'react'

import RoleFocusUser from './../Role/RoleFocusUser'

const b = block('MeetingReport')

export default function MeetingRolesExpiration(props) {
  const { meeting, meetingType } = props
  return (
    <span>
      {meeting.expiredRoles && meeting.expiredRoles.length > 0 && (
        <span>
          {meetingType === 'Gouvernance' ? (
            <h3>Elections:</h3>
          ) : (
            <h5>Following roles are/will be expired:</h5>
          )}
          <ul className={b.e('elections')}>
            {meeting.expiredRoles.map(focus => (
              <li key={focus.role_focus_id}>
                <span className={b.e('bullet')} />
                {focus.role_name}
                {focus.role_focus_users[0] && (
                  <RoleFocusUser
                    key={focus.role_focus_users[0].user_id}
                    focusName={focus.focus_name}
                    focusId={focus.role_focus_id}
                    duration={focus.duration}
                    focusUser={focus.role_focus_users[0]}
                  />
                )}
              </li>
            ))}
          </ul>
        </span>
      )}
    </span>
  )
}
