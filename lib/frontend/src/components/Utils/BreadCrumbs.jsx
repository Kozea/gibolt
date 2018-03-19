import './BreadCrumbs.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block } from '../../utils'

const b = block('BreadCrumbs')

export default function BreadCrumbs(props) {
  const { circle, role, focus } = props
  return (
    <article className={b()}>
      <span className={b('breadcrumbs')}>
        {circle && (
          <span>
            {circle.circle_parent[0] && (
              <span>
                <Link
                  to={{
                    pathname: '/circle',
                    search: stringify({
                      circle_id: circle.circle_parent[0].circle_id,
                    }),
                  }}
                >
                  {circle.circle_parent[0].circle_name}
                </Link>
                {' / '}
              </span>
            )}
            <span>
              <Link
                to={{
                  pathname: '/circle',
                  search: stringify({
                    circle_id: circle.circle_id,
                  }),
                }}
              >
                {circle.circle_name}
              </Link>
            </span>
            {role && (
              <span>
                {' / '}
                <Link
                  to={{
                    pathname: '/role',
                    search: stringify({
                      role_id: role.role_id,
                    }),
                  }}
                >
                  {role.role_name}
                </Link>
              </span>
            )}
            {focus && (
              <span>
                {' / '}
                <Link
                  to={{
                    pathname: '/role_focus',
                    search: stringify({
                      role_focus_id: focus.role_focus_id,
                    }),
                  }}
                >
                  {focus.focus_name}
                </Link>
              </span>
            )}
          </span>
        )}
      </span>
    </article>
  )
}
