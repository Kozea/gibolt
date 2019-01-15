import './StatusItem.sass'

import block from 'bemboo'
import { stringify } from 'query-string'
import React from 'react'
import { Link } from 'react-router-dom'

const b = block('StatusItem')

export default function StatusItem({ active, action, type, query, children }) {
  return (
    <li className={b.m({ active })}>
      <Link
        className={b.e('link')}
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
