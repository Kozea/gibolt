import './StatusItem.sass'

import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

import { block } from '../utils'

const b = block('StatusItem')

export default function StatusItem({ active, action, type, query, children }) {
  return (
    <li className={b({ active: active })}>
      <Link
        className={b('link')}
        to={{
          pathname: '/',
          search: stringify({
            ...query,
            [type]: action,
          }),
        }}
      >
        {children}
      </Link>
    </li>
  )
}
