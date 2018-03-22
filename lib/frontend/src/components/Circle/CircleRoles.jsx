import './Circle.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import CircleRolesType from './CircleRolesType'
import { block, sortRoles, roleTypes } from '../../utils'

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
            {roleTypes.map(roleType => (
              <CircleRolesType
                key={roleType.value}
                displayInactive={displayInactive}
                roleType={roleType.value}
                roleTypeName={roleType.name}
                sortedRoles={sortedRoles}
              />
            ))}
            {sortedRoles.filter(role => !role.role_type).length > 0 && (
              <CircleRolesType
                displayInactive={displayInactive}
                roleType={null}
                roleTypeName={'Pas de type défini'}
                sortedRoles={sortedRoles}
              />
            )}
          </span>
        ) : (
          <span>No roles defined</span>
        )}
      </article>
    )
  }
}
