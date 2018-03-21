import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import RoleFocusUser from '../Role/RoleFocusUser'
import { block, sortRoles } from '../../utils'

const b = block('Circle')

export default class CircleRoles extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      displayInactive: false,
    }
  }

  render() {
    const { circle } = this.props
    const { displayInactive } = this.state
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
          <span>
            <span className={b('check')}>
              <label
                htmlFor="checkbox"
                onChange={e =>
                  this.setState({ displayInactive: e.target.checked })
                }
              >
                <input type="checkbox" /> display inactive roles
              </label>
            </span>
            <ul>
              {sortedRoles
                .filter(role => (displayInactive ? true : role.is_active))
                .map(role => (
                  <span key={role.role_id}>
                    <li className={b('role')}>
                      <span className={b('bullet')} />
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
                              focusName={null}
                              duration={role.duration}
                              focusUser={roleFocus.role_focus_users[0]}
                            />
                          ))}
                        </span>
                      ) : (
                        ' : No focus defined'
                      )}
                    </li>
                  </span>
                ))}
            </ul>
          </span>
        ) : (
          <span>No roles defined</span>
        )}
      </article>
    )
  }
}
