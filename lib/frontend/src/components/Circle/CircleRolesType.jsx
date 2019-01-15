import './Circle.sass'

import block from 'bemboo'
import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import RoleFocusUser from '../Role/RoleFocusUser'

const b = block('Circle')

export default function CircleRolesType(props) {
  const { displayInactive, roleType, roleTypeName, sortedRoles } = props
  const filteredSortedRoles = sortedRoles.filter(
    role =>
      role.role_type === roleType && (displayInactive ? true : role.is_active)
  )

  return (
    <div className={b.e('roleFocus')}>
      <span className={b.e('roleFocusType')}>{roleTypeName}</span>
      {filteredSortedRoles.length > 0 ? (
        <ul>
          {sortedRoles
            .filter(
              role =>
                role.role_type === roleType &&
                (displayInactive ? true : role.is_active) &&
                !role.displayInElection
            )
            .map(role => (
              <span key={role.role_id}>
                <li className={b.e('role')}>
                  <span className={b.e('bullet')} />
                  <Link
                    to={{
                      pathname: '/role',
                      search: stringify({ role_id: role.role_id }),
                    }}
                  >
                    {role.role_name} {!role.is_active && ' (disabled)'}
                  </Link>{' '}
                  {role.role_focuses.length > 0 ? (
                    <span>
                      {role.role_focuses.map(roleFocus => (
                        <RoleFocusUser
                          key={roleFocus.role_focus_id}
                          focusId={roleFocus.role_focus_id}
                          focusName={roleFocus.focus_name}
                          duration={roleFocus.duration}
                          focusUser={roleFocus.role_focus_users[0]}
                        />
                      ))}
                    </span>
                  ) : (
                    ' : No active focus'
                  )}
                </li>
              </span>
            ))}
        </ul>
      ) : (
        <span>
          <br />
          No roles
        </span>
      )}
    </div>
  )
}
