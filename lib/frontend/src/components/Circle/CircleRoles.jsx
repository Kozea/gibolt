import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import RoleFocusUser from '../Role/RoleFocusUser'
import { block, sortRoles } from '../../utils'

const b = block('Circle')

export default function CircleRoles(props) {
  const { circle } = props
  const sortedRoles = sortRoles(circle.roles)

  return (
    <article>
      <h3>
        Roles{' '}
        {circle.is_active && (
          <Link
            to={{
              pathname: '/createRole',
              search: stringify({ circle_id: circle.circle_id }),
            }}
          >
            <span
              className={b('unlink')}
              disabled={!circle.is_active}
              title="Add role"
            >
              <i className="fa fa-plus-circle" aria-hidden="true" />
            </span>
          </Link>
        )}
      </h3>
      {sortedRoles && sortedRoles.length > 0 ? (
        <ul>
          {sortedRoles.map(role => (
            <li key={role.role_id} className={b('role')}>
              <span className={b('bullet')} />
              <Link
                to={{
                  pathname: '/role',
                  search: stringify({ role_id: role.role_id }),
                }}
              >
                {role.role_name}
              </Link>{' '}
              {role.role_focuses[0] ? (
                <span>
                  {role.role_focuses[0].role_focus_users[0] && (
                    <RoleFocusUser
                      duration={role.duration}
                      focusUser={role.role_focuses[0].role_focus_users[0]}
                    />
                  )}
                </span>
              ) : (
                ' : No focus defined'
              )}
            </li>
          ))}
        </ul>
      ) : (
        <span>No roles defined</span>
      )}
    </article>
  )
}
