import './StatusItem.sass'

import block from 'bemboo'
import React from 'react'
import { Link } from 'react-router-dom'

import { stringify } from '../utils/querystring'

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
