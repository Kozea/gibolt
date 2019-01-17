import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

import { stringify } from '../../utils/querystring'
import RoleFocusUser from '../Role/RoleFocusUser'

const b = block('Circle')

export default function CircleSubCircles(props) {
  return (
    <article>
      <h3>Sub-circles</h3>
      <ul>
        {props.circle.circle_children.map(child => (
          <li key={child.circle_id}>
            <span className={b.e('bullet')} />
            <Link
              to={{
                pathname: '/circle',
                search: stringify({ circle_id: child.circle_id }),
              }}
            >
              {child.circle_name}
            </Link>
            {child.roles &&
              child.roles
                .filter(role => role.role_name.match('Second lien'))
                .map(role => (
                  <div className={b.e('secondLink')} key={role.role_id}>
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
                      <>
                        {role.role_focuses.map(roleFocus => (
                          <RoleFocusUser
                            key={roleFocus.role_focus_id}
                            focusId={roleFocus.role_focus_id}
                            focusName={roleFocus.focus_name}
                            focusUser={roleFocus.role_focus_users[0]}
                          />
                        ))}
                      </>
                    ) : (
                      ' : No active focus'
                    )}
                  </div>
                ))}
          </li>
        ))}
      </ul>
    </article>
  )
}
