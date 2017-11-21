import './Preset.sass'

import React from 'react'
import { Link } from 'react-router-dom'

import { block } from '../utils'

const b = block('Preset')

export default function Preset({ active, action, children }) {
  return (
    <li className={b('item', { active: active })}>
      <Link className={b('link')} to={action}>
        {children}
      </Link>
    </li>
  )
}
