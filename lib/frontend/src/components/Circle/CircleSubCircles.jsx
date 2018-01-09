import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block, connect } from '../../utils'

const b = block('Circle')

function Circle({ circle }) {
  return (
    <article>
      <h3>Sub-circles</h3>
      <ul>
        {circle.children_circles.map(child => (
          <li key={child.circle_id}>
            <span className={b('bullet')} />
            <Link
              to={{
                pathname: '/circle',
                search: stringify({ circle_id: child.circle_id }),
              }}
            >
              {child.circle_name}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
export default connect(state => ({
  circle: state.circle.results,
}))(Circle)
